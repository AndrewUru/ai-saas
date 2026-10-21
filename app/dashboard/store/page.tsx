import Link from "next/link";
import { Store, Package, MessageSquare, CreditCard } from "lucide-react";
import { requireUser } from "@/lib/auth/requireUser";
import { getLocale } from "@/lib/i18n/server";
import type { NativeProduct } from "@/lib/commerce/catalog";
import { deleteProduct, linkAgent, saveProduct, saveStore } from "./actions";
import SaveButton from "./SaveButton";

const input =
  "mt-1 w-full rounded-xl border border-border bg-background px-3 py-2.5 text-sm";
const card = "rounded-2xl border border-border bg-surface p-5 sm:p-6";

export default async function StorePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const [{ supabase, user }, locale, params] = await Promise.all([
    requireUser(),
    getLocale(),
    searchParams,
  ]);
  const es = locale === "es";
  const text = (spanish: string, english: string) => (es ? spanish : english);
  const [storeResult, agentsResult] = await Promise.all([
    supabase
      .from("native_stores")
      .select("id, name, currency, published")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("agents")
      .select("id, name, native_store_id")
      .eq("user_id", user.id)
      .order("created_at"),
  ]);
  if (storeResult.error || agentsResult.error)
    return (
      <div className="mx-auto max-w-3xl p-8">
        <h1 className="text-2xl font-semibold">
          {text("Mi tienda", "My store")}
        </h1>
        <p className="mt-4" role="alert">
          {text(
            "No se ha podido cargar la tienda. Comprueba que se ha aplicado la migración de tiendas nativas y vuelve a intentarlo.",
            "Could not load the store. Check that the native store migration has been applied and try again.",
          )}
        </p>
      </div>
    );
  const store = storeResult.data;
  const productResult = store
    ? await supabase
        .from("native_products")
        .select("*")
        .eq("store_id", store.id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };
  const products = (productResult.data ?? []) as NativeProduct[];
  const agents = agentsResult.data ?? [];
  const saving = text("Guardando…", "Saving…");

  function productFields(product?: NativeProduct) {
    return (
      <>
        <input type="hidden" name="id" value={product?.id ?? ""} />
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            {text("Nombre", "Name")}
            <input
              className={input}
              name="name"
              required
              maxLength={160}
              defaultValue={product?.name}
            />
          </label>
          <label className="text-sm">
            {text("Categoría", "Category")}
            <input
              className={input}
              name="category"
              maxLength={80}
              defaultValue={product?.category}
            />
          </label>
          <label className="text-sm">
            {text("Precio", "Price")} ({store?.currency})
            <input
              className={input}
              name="price"
              inputMode="decimal"
              required
              placeholder="19.90"
              defaultValue={
                product ? (product.price_cents / 100).toFixed(2) : undefined
              }
            />
          </label>
          <label className="text-sm">
            {text("Existencias", "Stock")}
            <input
              className={input}
              name="stock"
              type="number"
              required
              min={0}
              max={1000000}
              step={1}
              defaultValue={product?.stock ?? 0}
            />
          </label>
        </div>
        <label className="block text-sm">
          {text("URL de la imagen (HTTPS)", "Image URL (HTTPS)")}
          <input
            className={input}
            name="image_url"
            type="url"
            maxLength={2000}
            placeholder="https://…"
            defaultValue={product?.image_url}
          />
        </label>
        <label className="block text-sm">
          {text("Descripción", "Description")}
          <textarea
            className={input}
            name="description"
            rows={3}
            maxLength={4000}
            defaultValue={product?.description}
          />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="active"
            defaultChecked={product?.active ?? false}
          />
          {text("Visible en el catálogo", "Visible in catalog")}
        </label>
      </>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-7 p-4 sm:p-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="mb-2 flex items-center gap-2 text-sm text-muted">
            <Store size={18} />
            {text(
              "Comercio dentro de tu widget",
              "Commerce inside your widget",
            )}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight">
            {text("Mi tienda", "My store")}
          </h1>
          <p className="mt-2 text-muted">
            {text(
              "Tu catálogo y tu asistente, en el mismo lugar.",
              "Your catalog and assistant, together.",
            )}
          </p>
        </div>
        <span className="rounded-full border border-border px-3 py-1 text-sm">
          {store?.published
            ? text("Catálogo publicado", "Catalog published")
            : text("Borrador", "Draft")}
        </span>
      </header>
      {params.error ? (
        <p role="alert" className="rounded-xl border border-red-400/40 p-4">
          {params.error === "invalid"
            ? text(
                "Revisa los campos: precio positivo con hasta dos decimales, stock entero e imagen HTTPS.",
                "Check the fields: positive price with up to two decimals, integer stock and HTTPS image.",
              )
            : text(
                "No se pudo guardar. Comprueba tu conexión y vuelve a intentarlo.",
                "Could not save. Check your connection and try again.",
              )}
        </p>
      ) : params.saved ? (
        <p
          role="status"
          className="rounded-xl border border-emerald-400/40 p-4"
        >
          {text("Cambios guardados.", "Changes saved.")}
        </p>
      ) : null}
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <section className={card}>
            <h2 className="mb-4 text-lg font-semibold">
              {text("1. Configura tu tienda", "1. Set up your store")}
            </h2>
            <form action={saveStore} className="space-y-4">
              <label className="block text-sm">
                {text("Nombre de la tienda", "Store name")}
                <input
                  className={input}
                  name="name"
                  required
                  maxLength={100}
                  defaultValue={store?.name}
                />
              </label>
              <label className="block text-sm">
                {text("Moneda del catálogo", "Catalog currency")}
                <select
                  className={input}
                  name="currency"
                  defaultValue={store?.currency ?? "EUR"}
                >
                  <option value="EUR">EUR · Euro</option>
                  <option value="USD">USD · US Dollar</option>
                  <option value="GBP">GBP · Pound Sterling</option>
                </select>
              </label>
              <p className="text-xs text-muted">
                {text(
                  "Cambiar la moneda no convierte los precios. Revisa el catálogo antes de publicarlo.",
                  "Changing currency does not convert prices. Review your catalog before publishing.",
                )}
              </p>
              <label className="flex items-center gap-2 text-sm">
                <input
                  name="published"
                  type="checkbox"
                  defaultChecked={store?.published}
                />
                {text(
                  "Publicar el catálogo en los widgets vinculados",
                  "Publish catalog in linked widgets",
                )}
              </label>
              <SaveButton
                label={text("Guardar tienda", "Save store")}
                pending={saving}
              />
            </form>
          </section>
          {store ? (
            <section className={card}>
              <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold">
                <Package size={20} />
                {text("2. Productos", "2. Products")} ({products.length})
              </h2>
              <details
                className="rounded-xl border border-border p-4"
                open={products.length === 0}
              >
                <summary className="cursor-pointer font-medium">
                  {text("Añadir producto", "Add product")}
                </summary>
                <form action={saveProduct} className="mt-4 space-y-4">
                  {productFields()}
                  <SaveButton
                    label={text("Crear producto", "Create product")}
                    pending={saving}
                  />
                </form>
              </details>
              {productResult.error ? (
                <p role="alert" className="mt-4">
                  {text(
                    "No se pudieron cargar los productos.",
                    "Products could not be loaded.",
                  )}
                </p>
              ) : null}
              <div className="mt-4 space-y-3">
                {products.map((product) => (
                  <details
                    key={product.id}
                    className="rounded-xl border border-border p-4"
                  >
                    <summary className="cursor-pointer">
                      <span className="font-medium">{product.name}</span>
                      <span className="ml-2 text-sm text-muted">
                        {new Intl.NumberFormat(locale, {
                          style: "currency",
                          currency: store.currency,
                        }).format(product.price_cents / 100)}{" "}
                        · {product.stock} {text("uds.", "units")} ·{" "}
                        {product.active
                          ? text("Visible", "Visible")
                          : text("Oculto", "Hidden")}
                      </span>
                    </summary>
                    <form action={saveProduct} className="mt-4 space-y-4">
                      {productFields(product)}
                      <SaveButton
                        label={text("Guardar producto", "Save product")}
                        pending={saving}
                      />
                    </form>
                    <details className="mt-4 text-sm">
                      <summary className="cursor-pointer text-red-500">
                        {text("Eliminar producto", "Delete product")}
                      </summary>
                      <form action={deleteProduct} className="mt-3 space-y-3">
                        <input type="hidden" name="id" value={product.id} />
                        <p>
                          {text(
                            "Se eliminará del catálogo. Esta acción no se puede deshacer.",
                            "This removes the product from your catalog and cannot be undone.",
                          )}
                        </p>
                        <SaveButton
                          label={text(
                            "Confirmar eliminación",
                            "Confirm deletion",
                          )}
                          pending={saving}
                        />
                      </form>
                    </details>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>
        <aside className="space-y-6">
          <section className={card}>
            <h2 className="flex items-center gap-2 font-semibold">
              <MessageSquare size={19} />
              {text("3. Vincula tu widget", "3. Link your widget")}
            </h2>
            <p className="my-3 text-sm text-muted">
              {text(
                "El catálogo nativo tendrá prioridad en los agentes vinculados. Al desvincularlo, se recupera el catálogo externo.",
                "The native catalog takes priority for linked agents. Unlink it to restore the external catalog.",
              )}
            </p>
            {!store ? (
              <p className="text-sm">
                {text("Guarda primero tu tienda.", "Save your store first.")}
              </p>
            ) : agents.length === 0 ? (
              <Link className="underline" href="/dashboard/agents">
                {text("Crear un agente", "Create an agent")}
              </Link>
            ) : (
              <div className="space-y-4">
                {agents.map((agent) => (
                  <div key={agent.id} className="border-t border-border pt-3">
                    <p className="mb-2 text-sm font-medium">{agent.name}</p>
                    <form action={linkAgent}>
                      <input type="hidden" name="agent_id" value={agent.id} />
                      <input
                        type="hidden"
                        name="unlink"
                        value={agent.native_store_id === store.id ? "1" : "0"}
                      />
                      <SaveButton
                        label={
                          agent.native_store_id === store.id
                            ? text("Desvincular", "Unlink")
                            : text("Vincular tienda", "Link store")
                        }
                        pending={saving}
                      />
                    </form>
                    <Link
                      href={`/dashboard/agents/${agent.id}/widget`}
                      className="mt-2 block text-sm underline"
                    >
                      {text("Diseñar widget", "Design widget")}
                    </Link>
                    <Link
                      href={`/dashboard/agents/${agent.id}/install`}
                      className="mt-2 block text-sm underline"
                    >
                      {text("Instalar widget", "Install widget")}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </section>
          <section className={card}>
            <h2 className="flex items-center gap-2 font-semibold">
              <CreditCard size={19} />
              {text("Pagos", "Payments")}
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              <p>
                Stripe{" "}
                <span className="text-muted">
                  · {text("Pendiente de conexión", "Connection pending")}
                </span>
              </p>
              <p>
                PayPal{" "}
                <span className="text-muted">
                  · {text("Pendiente de conexión", "Connection pending")}
                </span>
              </p>
              <p className="text-muted">
                {text(
                  "Esta entrega permite explorar productos y preparar el carrito. El cobro se habilitará al completar la integración de pagos por vendedor.",
                  "This release supports browsing products and building a cart. Payments will be enabled after merchant payment integration is complete.",
                )}
              </p>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
