import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { randomUUID } from "node:crypto";
import ts from "typescript";
import { createRequire } from "node:module";
const requireModule = createRequire(import.meta.url);

// Load these pure TS modules without a production bundler or extra test dependency.
function loadTs(filename) {
  const full = path.resolve(filename);
  const output = ts.transpileModule(fs.readFileSync(full, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = { exports: {} };
  const localRequire = (name) =>
    name.startsWith(".")
      ? loadTs(path.resolve(path.dirname(full), name + ".ts"))
      : name.startsWith("@/")
        ? loadTs(path.resolve(name.slice(2) + ".ts"))
        : requireModule(name);
  new Function("require", "module", "exports", output)(
    localRequire,
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}

const { parsePrice, productSchema } = loadTs("lib/commerce/catalog.ts");
const { renderWidgetScript } = loadTs("lib/widget/clientScript.ts");
const { chatRequestSchema } = loadTs("lib/contracts/agent.ts");
const { prepareCartChange, nativeSalesReply, productTerms } = loadTs(
  "lib/commerce/sales-agent.ts",
);

const STORE = { id: randomUUID(), currency: "EUR" };
const product = (name, extra = {}) => ({
  id: randomUUID(),
  name,
  description: "",
  category: "",
  image_url: "",
  price_cents: 1000,
  stock: 5,
  active: true,
  ...extra,
});
const RED = product("Camiseta roja");
const BLUE = product("Camiseta azul");
const COFFEE_MAKER = product("Cafetera italiana", {
  description: "Prepara café en casa",
});
const HIDDEN = product("Gorra", { active: false });
const CATALOG = [RED, BLUE, COFFEE_MAKER, HIDDEN];
const cartContext = (extra = {}) => ({
  store_id: STORE.id,
  currency: "EUR",
  revision: 3,
  items: [],
  focused_product_id: null,
  suggested_product_ids: [],
  ...extra,
});

// Minimal PostgREST stand-in; full-text search follows to_tsquery('simple') AND/OR semantics.
function fakeDb(rows = CATALOG) {
  const normalize = (value) =>
    value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  return {
    from(table) {
      const filters = [];
      const run = () => {
        let data = rows.slice();
        for (const [kind, column, value] of filters) {
          if (kind === "eq" && column in (data[0] ?? {}))
            data = data.filter((row) => row[column] === value);
          if (kind === "in") data = data.filter((row) => value.includes(row.id));
          if (kind === "fts")
            data = data.filter((row) => {
              const words = normalize(
                row.name + " " + row.category + " " + row.description,
              ).split(/[^a-z0-9]+/);
              return value
                .split(" & ")
                .every((group) =>
                  group
                    .replace(/[()]/g, "")
                    .split(" | ")
                    .some((term) => words.includes(term)),
                );
            });
        }
        return { data, error: null };
      };
      const query = {
        select: () => query,
        eq: (column, value) => (filters.push(["eq", column, value]), query),
        in: (column, value) => (filters.push(["in", column, value]), query),
        textSearch: (column, value) => (filters.push(["fts", column, value]), query),
        order: () => query,
        limit: async () => run(),
        maybeSingle: async () => ({
          data: table === "native_stores" ? STORE : null,
          error: null,
        }),
      };
      return query;
    },
  };
}
const change = (operation, product_query, quantity, context = cartContext()) =>
  prepareCartChange(fakeDb(), STORE, context, { operation, product_query, quantity }, true);

test("chat requests tolerate malformed widget history and cart context", () => {
  const parsed = chatRequestSchema.parse({
    api_key: "agt_test",
    message: "hola",
    cart_context: { store_id: "not-a-uuid" },
    messages: [
      { role: "system", content: "ignored" },
      { role: "assistant", content: "x".repeat(20000) },
      ...Array.from({ length: 30 }, (_, i) => ({ role: "user", content: String(i) })),
    ],
  });
  assert.equal(parsed.cart_context, undefined);
  assert.equal(parsed.messages.length, 20);
  assert.equal(parsed.messages.at(-1).content, "29");
  assert.deepEqual(chatRequestSchema.parse({ api_key: "k", message: "m" }).messages, []);
  const long = chatRequestSchema.parse({
    api_key: "k",
    message: "m",
    messages: [{ role: "assistant", content: "x".repeat(20000) }],
  });
  assert.equal(long.messages[0].content.length, 2000);
});

test("cart product search matches singular and plural forms without prefix widening", async () => {
  assert.deepEqual(productTerms("¿?"), []);
  const plural = await change("add", "camisetas rojas", 2);
  assert.equal(plural.cartAction.product.id, RED.id);
  assert.equal(plural.cartAction.before_quantity, 0);
  assert.equal(plural.cartAction.after_quantity, 2);
  assert.equal(plural.cartAction.expected_revision, 3);
  const coffee = await change("add", "café", 1);
  assert.equal(coffee.cartAction, undefined, "a description match must not change the cart");
  assert.match(coffee.reply, /¿Te refieres a Cafetera italiana\?/);
  const prefix = await change("add", "cafeter", 1);
  assert.equal(prefix.cartAction, undefined, "partial words are not prefixes");
  const hidden = await change("add", "gorra", 1);
  assert.equal(hidden.cartAction, undefined, "inactive products cannot be added");
});

test("ambiguous cart references ask instead of picking a product", async () => {
  const ambiguous = await change("add", "camiseta", 1);
  assert.equal(ambiguous.cartAction, undefined);
  assert.match(ambiguous.reply, /Camiseta roja.*Camiseta azul|Camiseta azul.*Camiseta roja/);
  const suggested = await change(
    "add",
    "camiseta",
    1,
    cartContext({ suggested_product_ids: [BLUE.id, COFFEE_MAKER.id] }),
  );
  assert.equal(suggested.cartAction.product.id, BLUE.id);
  const pronoun = await change(
    "add",
    "",
    2,
    cartContext({ suggested_product_ids: [RED.id, BLUE.id] }),
  );
  assert.equal(pronoun.cartAction, undefined);
  const focused = await change(
    "add",
    "",
    2,
    cartContext({ focused_product_id: RED.id, suggested_product_ids: [BLUE.id] }),
  );
  assert.equal(focused.cartAction.product.id, RED.id);
});

test("cart changes respect the current cart, stock and store", async () => {
  const inCart = cartContext({ items: [{ id: RED.id, quantity: 4 }] });
  const remove = await change("remove", "camiseta", 0, inCart);
  assert.equal(remove.cartAction.product.id, RED.id);
  assert.equal(remove.cartAction.after_quantity, 0);
  const tooMany = await change("add", "", 2, inCart);
  assert.equal(tooMany.cartAction, undefined);
  assert.match(tooMany.reply, /5 unidades/);
  const set = await change("set", "", 5, inCart);
  assert.equal(set.cartAction.after_quantity, 5);
  const notInCart = await change("remove", "camiseta azul", 0, inCart);
  assert.equal(notInCart.cartAction, undefined);
  const otherStore = await change("add", "camiseta roja", 1, cartContext({ store_id: randomUUID() }));
  assert.equal(otherStore.cartAction, undefined);
});

test("seller replies keep product cards compact and only offer cart tools with a cart", async () => {
  const bodies = [];
  const responses = [
    { tool_calls: [{ id: "c1", type: "function", function: { name: "search_products", arguments: '{"query":"cafetera"}' } }] },
    { content: "Esta cafetera prepara café en casa." },
  ];
  const fetcher = async (_url, init) => {
    bodies.push(JSON.parse(init.body));
    return new Response(JSON.stringify({ choices: [{ message: responses.shift() }] }));
  };
  const options = {
    db: fakeDb(),
    storeId: STORE.id,
    userId: "owner",
    message: "¿Tienes cafeteras?",
    history: [{ role: "user", content: "¿Tienes cafeteras?" }],
    systemPrompt: "Vende",
    knowledge: null,
    language: "es",
    apiKey: "sk-test",
    model: "test",
    fetcher,
  };
  const result = await nativeSalesReply(options);
  const reply = JSON.parse(result.reply);
  assert.equal(reply.type, "product_list");
  assert.equal(reply.items[0].id, COFFEE_MAKER.id);
  assert.equal("description" in reply.items[0], false);
  assert.deepEqual(bodies[0].tools.map((tool) => tool.function.name), ["search_products"]);
  assert.equal(bodies[0].messages.filter((m) => m.content === options.message).length, 1);

  responses.push({ tool_calls: [{ id: "c2", type: "function", function: { name: "change_cart", arguments: '{"operation":"add","product_query":"cafetera","quantity":1}' } }] });
  const withCart = await nativeSalesReply({ ...options, context: cartContext() });
  assert.deepEqual(bodies.at(-1).tools.map((tool) => tool.function.name), ["search_products", "change_cart"]);
  assert.equal(withCart.cartAction.product.id, COFFEE_MAKER.id);
});

test("prices preserve cents and reject unsafe representations", () => {
  assert.equal(parsePrice("19,90"), 1990);
  assert.equal(parsePrice("0.01"), 1);
  assert.equal(parsePrice("1000000"), 100000000);
  for (const value of [
    "-1",
    "0",
    "1.999",
    "1e2",
    "Infinity",
    "NaN",
    "",
    "1000000.01",
    "1 000",
  ])
    assert.equal(parsePrice(value), null, value);
});

test("products reject script URLs, fractional stock and negative prices", () => {
  const valid = {
    name: "Café",
    description: "",
    category: "",
    image_url: "",
    price_cents: 100,
    stock: 2,
    active: true,
  };
  assert.equal(productSchema.safeParse(valid).success, true);
  for (const change of [
    { image_url: "javascript:alert(1)" },
    { image_url: "http://example.com/a.png" },
    { stock: 1.5 },
    { stock: -1 },
    { price_cents: -100 },
    { name: " " },
  ]) {
    assert.equal(
      productSchema.safeParse({ ...valid, ...change }).success,
      false,
    );
  }
});

test("generated widget remains valid JavaScript with native commerce enabled", () => {
  const script = renderWidgetScript("agt_test", "https://example.com", {
    nativeStoreEnabled: true,
  });
  assert.doesNotThrow(() => new vm.Script(script));
  assert.ok(script.includes("/api/widget/store?key="));
});
