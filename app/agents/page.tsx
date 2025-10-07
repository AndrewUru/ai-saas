import { createServer } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AgentsPage() {
  const supabase = await createServer();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  async function createAgent(formData: FormData) {
    "use server";
    const name = String(formData.get("name") || "").trim();
    const supabase = await createServer();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user || !name) return;
    // api_key simple: prefijo + random; (en producción usa uuid + hash)
    const rawKey =
      "agt_" + Math.random().toString(36).slice(2) + Date.now().toString(36);
    await supabase.from("agents").insert({
      user_id: user.id,
      name,
      api_key: rawKey,
      is_active: true,
      messages_limit: 1000,
    });
    redirect("/agents");
  }

  return (
    <section className="grid md:grid-cols-2 gap-4">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h1 className="font-semibold mb-2">Tus agentes</h1>
        {!agents?.length && (
          <p className="text-sm text-gray-500">Sin agentes aún.</p>
        )}
        <ul className="divide-y">
          {agents?.map((a) => (
            <li key={a.id} className="py-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{a.name}</div>
                  <div className="text-xs text-gray-500">
                    API Key: {a.api_key?.slice(0, 6)}••••
                  </div>
                </div>
                <a
                  className="text-sm text-blue-600 hover:underline"
                  href={`/agents/${a.id}`}
                >
                  Configurar
                </a>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow">
        <h2 className="font-semibold mb-2">Crear agente</h2>
        <form action={createAgent} className="space-y-3">
          <input
            name="name"
            placeholder="Nombre del agente"
            className="w-full rounded border px-3 py-2"
            required
          />
          <button className="rounded bg-black text-white px-3 py-2 text-sm">
            Crear
          </button>
        </form>
        <p className="text-xs text-gray-500 mt-3">
          Tras crear, copia la API Key desde el detalle del agente para usar el
          snippet.
        </p>
      </div>
    </section>
  );
}
