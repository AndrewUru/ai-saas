// Browser contract tests with controlled catalog/API responses; no real payments or merchant data.
import assert from "node:assert/strict";
import path from "node:path";
import fs from "node:fs";
import ts from "typescript";
import { createRequire } from "node:module";
const requireModule = createRequire(import.meta.url);
function loadTs(file) {
  const full = path.resolve(file);
  const output = ts.transpileModule(fs.readFileSync(full, "utf8"), {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;
  const loaded = { exports: {} };
  new Function("require", "module", "exports", output)(
    (name) =>
      name.startsWith(".")
        ? loadTs(path.resolve(path.dirname(full), name + ".ts"))
        : requireModule(name),
    loaded,
    loaded.exports,
  );
  return loaded.exports;
}
const { renderWidgetScript } = loadTs("lib/widget/clientScript.ts");
const { widgetAppearanceDefaults } = loadTs("lib/widget/defaults.ts");
const { chromium } = requireModule(
  process.env.PLAYWRIGHT_MODULE_PATH || "playwright",
);

(async () => {
  const browser = await chromium.launch({ channel: "msedge", headless: true });
  try {
    for (const format of ["classic", "assistant"]) {
      const context = await browser.newContext({
        viewport: { width: 1280, height: 900 },
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      let stock = 3;
      let fail = false;
      const fixture = () => ({
        store: { id: "store-test", name: "Tienda de prueba", currency: "EUR" },
        products: [
          {
            id: "product-1",
            name: "Café natural",
            category: "Café",
            description: "Tueste suave",
            price_cents: 1990,
            stock,
            image_url: "",
          },
          {
            id: "product-2",
            name: "<img src=x onerror=alert(1)>",
            category: "Accesorios",
            description: "Texto seguro",
            price_cents: 800,
            stock: 0,
            image_url: "",
          },
        ],
        nextOffset: null,
      });
      await page.route("https://widget.test/**", async (route) => {
        const url = new URL(route.request().url());
        if (url.pathname === "/")
          return route.fulfill({
            contentType: "text/html",
            body: '<html lang="es"><body><h1>Web del comercio</h1></body></html>',
          });
        if (url.pathname === "/api/widget/config")
          return route.fulfill({
            json: {
              key: "agt_test",
              nativeStoreEnabled: true,
              language: "es",
              format,
              brandName: "Tienda de prueba",
              greeting: "Encuentra tu producto",
              bubbleUseThree: false,
              appearance: widgetAppearanceDefaults[format],
            },
          });
        if (url.pathname === "/api/widget/store")
          return route.fulfill(
            fail
              ? { status: 503, json: { error: "Unavailable" } }
              : { json: fixture() },
          );
        if (url.pathname === "/api/agent/chat")
          return route.fulfill({
            json: {
              reply: JSON.stringify({
                type: "product_list",
                items: [
                  {
                    ...fixture().products[0],
                    native_product: true,
                    price: "19.90",
                    currency: "EUR",
                  },
                ],
              }),
            },
          });
        return route.fulfill({ json: {} });
      });
      const load = async () => {
        await page.goto("https://widget.test/");
        await page.addScriptTag({
          content: renderWidgetScript(
            "agt_test",
            "https://widget.test",
            {},
            { autoOpen: true },
          ),
        });
        await page.locator(".ai-store-nav").waitFor();
        await page
          .locator(".ai-store-nav")
          .getByRole("button", { name: "Tienda", exact: true })
          .click();
        await page
          .getByRole("heading", { name: "Tienda de prueba", exact: true })
          .waitFor();
      };
      await load();
      assert.equal(await page.locator(".ai-store-card").count(), 2);
      assert.equal(
        await page.locator(".ai-store-card img").count(),
        0,
        "Product names must be text, not HTML",
      );
      await page
        .getByRole("searchbox", { name: "Buscar productos…" })
        .fill("cafe");
      assert.equal(await page.locator(".ai-store-card").count(), 1);
      await page
        .getByRole("button", { name: "Ver Café natural", exact: true })
        .click();
      await page.getByLabel("Cantidad", { exact: true }).fill("2");
      await page
        .getByRole("button", { name: "Añadir al carrito", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Carrito (2)", exact: true })
        .click();
      assert.match(await page.locator(".ai-store-panel").innerText(), /39,80/);
      assert.equal(
        await page
          .getByRole("button", { name: "Checkout pendiente de activación" })
          .isDisabled(),
        true,
      );
      await load();
      await page
        .getByRole("button", { name: "Carrito (2)", exact: true })
        .click();
      stock = 1;
      await page
        .getByRole("button", { name: "Actualizar precios y disponibilidad" })
        .click();
      await page
        .getByRole("button", { name: "Carrito (1)", exact: true })
        .waitFor();
      fail = true;
      await page
        .getByRole("button", { name: "Actualizar precios y disponibilidad" })
        .click();
      await page
        .getByRole("button", { name: "Reintentar", exact: true })
        .waitFor();
      fail = false;
      await page
        .getByRole("button", { name: "Reintentar", exact: true })
        .click();
      await page
        .getByRole("button", { name: "Actualizar precios y disponibilidad" })
        .waitFor();
      await page.getByRole("button", { name: "Chat", exact: true }).click();
      await page.locator("#ai-saas-form input").fill("cafe");
      await page
        .locator("#ai-saas-form")
        .evaluate((form) => form.requestSubmit());
      await page.locator('[data-native-product="product-1"]').click();
      await page
        .getByRole("button", { name: "Añadir al carrito", exact: true })
        .waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      const box = await page.locator("#ai-saas-widget").boundingBox();
      assert.ok(
        box.width <= 390 && box.height <= 844,
        "Widget must fit mobile viewport",
      );
      await page
        .getByRole("button", { name: "Carrito (1)", exact: true })
        .click();
      await page.screenshot({
        path: path.join(
          process.env.TEMP || ".",
          "native-store-" + format + ".png",
        ),
      });
      assert.deepEqual(errors, []);
      console.log(
        format +
          ": catalog, safe text, search, detail, cart, persistence, stock reconciliation, retry, chat cards and mobile passed",
      );
      await context.close();
    }
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
