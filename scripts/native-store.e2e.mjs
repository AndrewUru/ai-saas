// Explicit integration test: creates and removes a temporary merchant in the configured Supabase project.
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { createRequire } from "node:module";
const requireModule = createRequire(import.meta.url);
const { chromium } = requireModule(
  process.env.PLAYWRIGHT_MODULE_PATH || "playwright",
);
process.loadEnvFile(".env.local");

(async () => {
  const base = process.env.STORE_TEST_BASE_URL || "http://localhost:3011";
  const admin = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );
  const email = "native-store-test-" + randomUUID() + "@example.com";
  const password = randomUUID() + "aA1!";
  let userId, browser;
  const checked = (result) => {
    if (result.error) throw new Error(result.error.message);
    return result.data;
  };
  try {
    userId = checked(
      await admin.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      }),
    ).user.id;
    const key = "agt_" + randomUUID().replaceAll("-", "");
    const agent = checked(
      await admin
        .from("agents")
        .insert({
          user_id: userId,
          name: "Native store test",
          api_key: key,
          is_active: true,
          language: "es",
          allowed_domains: ["localhost"],
          widget_bubble_use_three: false,
        })
        .select("id")
        .single(),
    );
    let cookies = [];
    const auth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll: () => [],
          setAll: (updates) => {
            cookies = updates;
          },
        },
      },
    );
    checked(await auth.auth.signInWithPassword({ email, password }));
    browser = await chromium.launch({ channel: "msedge", headless: true });
    const context = await browser.newContext({ locale: "es-ES" });
    await context.addCookies([
      ...cookies.map((cookie) => ({
        name: cookie.name,
        value: cookie.value,
        domain: "localhost",
        path: "/",
        sameSite: "Lax",
      })),
      { name: "locale", value: "es", domain: "localhost", path: "/" },
    ]);
    const page = await context.newPage();
    page.setDefaultTimeout(60000);
    await page.goto(base + "/dashboard/store", { timeout: 90000 });
    await page
      .getByLabel("Nombre de la tienda", { exact: true })
      .fill("Tienda E2E");
    await page
      .getByLabel("Publicar el catálogo en los widgets vinculados")
      .check();
    await page
      .getByRole("button", { name: "Guardar tienda", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Crear producto", exact: true })
      .waitFor();
    const form = page
      .locator("form")
      .filter({
        has: page.getByRole("button", { name: "Crear producto", exact: true }),
      });
    await form.getByLabel("Nombre", { exact: true }).fill("Café E2E");
    await form.getByLabel("Categoría", { exact: true }).fill("Café");
    await form.getByLabel("Precio (EUR)", { exact: true }).fill("19.90");
    await form.getByLabel("Existencias", { exact: true }).fill("3");
    await form
      .getByLabel("Descripción", { exact: true })
      .fill("Producto temporal de prueba");
    await form.getByLabel("Visible en el catálogo").check();
    await form
      .getByRole("button", { name: "Crear producto", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Vincular tienda", exact: true })
      .click();
    await page
      .getByRole("button", { name: "Desvincular", exact: true })
      .waitFor();
    const store = checked(
      await admin
        .from("native_stores")
        .select("id")
        .eq("user_id", userId)
        .single(),
    );
    const product = checked(
      await admin
        .from("native_products")
        .select("id,price_cents,stock")
        .eq("store_id", store.id)
        .single(),
    );
    assert.equal(product.price_cents, 1990);
    assert.equal(product.stock, 3);
    const catalog = await fetch(base + "/api/widget/store?key=" + key, {
      headers: { origin: base },
    });
    assert.equal(catalog.status, 200);
    assert.equal((await catalog.json()).products.length, 1);
    const denied = await fetch(base + "/api/widget/store?key=" + key, {
      headers: { origin: "https://denied.example" },
    });
    assert.equal(denied.status, 403);
    await page.screenshot({
      path: (process.env.TEMP || ".") + "/native-store-dashboard.png",
      fullPage: true,
    });
    await page.goto(base + "/api/ok");
    await page.addScriptTag({ url: base + "/api/widget?key=" + key });
    await page.locator("#ai-saas-toggle").click();
    await page
      .locator(".ai-store-nav")
      .getByRole("button", { name: "Tienda", exact: true })
      .click();
    await page
      .getByRole("heading", { name: "Café E2E", exact: true })
      .waitFor();
    await page.getByRole("button", { name: "Añadir", exact: true }).click();
    await page
      .getByRole("button", { name: "Carrito (1)", exact: true })
      .click();
    assert.match(await page.locator(".ai-store-panel").innerText(), /19,90/);
    checked(
      await admin
        .from("native_products")
        .update({ active: false })
        .eq("id", product.id),
    );
    await page
      .getByRole("button", { name: "Actualizar precios y disponibilidad" })
      .click();
    await page.getByText("Tu carrito está vacío.", { exact: true }).waitFor();
    checked(
      await admin
        .from("native_stores")
        .update({ published: false })
        .eq("id", store.id),
    );
    const unpublished = await fetch(base + "/api/widget/store?key=" + key, {
      headers: { origin: base },
    });
    assert.equal((await unpublished.json()).store, null);
    checked(
      await admin
        .from("agents")
        .update({ is_active: false })
        .eq("id", agent.id),
    );
    const inactive = await fetch(base + "/api/widget/store?key=" + key, {
      headers: { origin: base },
    });
    assert.equal(inactive.status, 404);
    console.log(
      "Real Supabase + dashboard actions + public API + widget cart passed; domain, publication and inactive-agent restrictions passed.",
    );
  } finally {
    if (browser) await browser.close();
    if (userId) {
      checked(await admin.from("agents").delete().eq("user_id", userId));
      checked(await admin.auth.admin.deleteUser(userId));
      console.log("Temporary merchant and test data removed.");
    }
  }
})().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
