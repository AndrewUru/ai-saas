import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
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
