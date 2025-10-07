import { redirect, notFound } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

// ---- Utilidades de servidor (no usan window)
function toHostname(raw: string): string | null {
  const s = raw.trim().toLowerCase();
  if (!s) return null;
  // Añadimos esquema si hace falta para que URL lo parsee
  try {
    const hasScheme = /^https?:\/\//i.test(s);
    const u = new URL(hasScheme ? s : `https://${s}`);
    return u.hostname.replace(/^www\./, "");
  } catch {
    // fallback: cadena sin espacios y sin comas
    if (/^[a-z0-9.-]+$/i.test(s)) return s.replace(/^www\./, "");
    return null;
  }
}

function normalizeDomainList(input: string): string[] {
  const uniq = new Set<string>();
  for (const part of input.split(",")) {
    const host = toHostname(part || "");
    if (host) uniq.add(host);
  }
  return Array.from(uniq).slice(0, 50); // límite defensivo
}

// ---- Server Action: actualizar integración y dominios
async function updateIntegrationAndDomains(formData: FormData) {
  "use server";
  const supabase = await createServer();

  // Usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Campos del form
  const agentId = String(formData.get("agent_id") || "");
  const integrationId = String(formData.get("integration_id") || "");
  const domainsRaw = String(formData.get("allowed_domains") || "");

  // Normalizar valores
  const allowed_domains = normalizeDomainList(domainsRaw);
  const woo_integration_id =
    integrationId && integrationId !== "none" ? integrationId : null;

  // (Opcional) Validación extra: que la integración pertenezca al usuario
  if (woo_integration_id) {
    const { data: integ, error: integErr } = await supabase
      .from("integrations_woocommerce")
      .select("id, user_id, is_active")
      .eq("id", woo_integration_id)
      .single();

    if (integErr || !integ || integ.user_id !== user.id) {
      // integración inválida para este usuario
      redirect(`/agents/${agentId}?error=integration`);
    }
    if (integ && integ.is_active === false) {
      redirect(`/agents/${agentId}?error=integration_inactive`);
    }
  }

  // Actualizar agente (RLS: user_id debe coincidir)
  const { error: upErr } = await supabase
    .from("agents")
    .update({
      woo_integration_id,
      allowed_domains: allowed_domains.length ? allowed_domains : null, // null si vacío
      updated_at: new Date().toISOString(),
    })
    .eq("id", agentId)
    .eq("user_id", user.id);

  if (upErr) {
    redirect(`/agents/${agentId}?error=save`);
  }

  redirect(`/agents/${agentId}?saved=1`);
}

type AgentDetailPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AgentDetailPage({
  params,
  searchParams,
}: AgentDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const supabase = await createServer();

  // Usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Agente
  const { data: agent, error: agentErr } = await supabase
    .from("agents")
    .select(
      "id, user_id, name, api_key, woo_integration_id, allowed_domains, messages_limit, is_active, created_at"
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (agentErr || !agent) return notFound();

  // Integraciones Woo del usuario
  const { data: integrations } = await supabase
    .from("integrations_woocommerce")
    .select("id, site_url, is_active, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  const saved = resolvedSearchParams.saved === "1";
  const errorParam = resolvedSearchParams.error;
  const err =
    typeof errorParam === "string" ? errorParam : null;

  return (
    <section className="max-w-2xl space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h1 className="text-xl font-semibold mb-1">{agent.name}</h1>
        <p className="text-sm text-gray-600 break-all">
          <b>API Key:</b> {agent.api_key}
        </p>
      </div>

      {saved && (
        <div className="rounded-lg border border-emerald-300 bg-emerald-50 text-emerald-900 p-3 text-sm">
          ✅ Cambios guardados correctamente.
        </div>
      )}
      {err && (
        <div className="rounded-lg border border-rose-300 bg-rose-50 text-rose-900 p-3 text-sm">
          {err === "integration" &&
            "La integración seleccionada no pertenece a tu cuenta."}
          {err === "integration_inactive" &&
            "La integración seleccionada está inactiva."}
          {err === "save" && "No se pudo guardar. Intenta nuevamente."}
        </div>
      )}

      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="font-semibold mb-3">Integración y dominios</h2>

        <form action={updateIntegrationAndDomains} className="space-y-4">
          {/* Agente actual */}
          <input type="hidden" name="agent_id" value={agent.id} />

          {/* Selector de integración Woo */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Integración de WooCommerce
            </label>
            <select
              name="integration_id"
              defaultValue={agent.woo_integration_id || "none"}
              className="w-full rounded border px-3 py-2"
            >
              <option value="none">— Ninguna —</option>
              {(integrations || []).map((i) => (
                <option key={i.id} value={i.id}>
                  {i.site_url} {i.is_active ? "" : "(inactiva)"}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Las credenciales se usarán solo para este agente. Puedes
              gestionarlas en{" "}
              <a href="/integrations/woo" className="underline">
                Integraciones
              </a>
              .
            </p>
          </div>

          {/* Dominios permitidos */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Dominios permitidos (opcional)
            </label>
            <input
              name="allowed_domains"
              placeholder="midominio.com, tienda.com"
              defaultValue={(agent.allowed_domains || []).join(", ")}
              className="w-full rounded border px-3 py-2"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separa por comas. Ej.: <code>midominio.com, tienda.com</code>. Si
              lo dejas vacío, no se restringe por dominio.
            </p>
          </div>

          <div className="flex gap-2">
            <button className="rounded bg-black text-white px-3 py-2 text-sm">
              Guardar
            </button>
            <a
              href={`/agents/${agent.id}`}
              className="rounded border px-3 py-2 text-sm"
            >
              Cancelar
            </a>
          </div>
        </form>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="font-semibold mb-2">Snippet</h2>
        <p className="text-sm text-gray-600 mb-2">
          Inserta este script en tu WordPress (footer o widget HTML). Usa la API
          Key del agente.
        </p>
        <pre className="text-xs bg-gray-900 text-green-200 p-3 rounded-lg overflow-auto">
          {`<script>
  (function(){
    var s=document.createElement('script');
    s.src='https://tu-dominio.com/widget.js?key=${agent.api_key}';
    s.defer=true; document.head.appendChild(s);
  })();
</script>`}
        </pre>
      </div>
    </section>
  );
}
