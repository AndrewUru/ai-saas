import { redirect } from "next/navigation";
import { createServer } from "@/lib/supabase/server";

export default async function DashboardPage() {
  // 👇 tu función es async, así que aquí usamos await
  const supabase = await createServer();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // perfiles (sin email, se toma de user.email)
  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, active_until")
    .eq("id", user.id)
    .single();

  const { data: agents } = await supabase
    .from("agents")
    .select("id, name, api_key, is_active, messages_limit")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="grid md:grid-cols-3 gap-4">
      <div className="col-span-2 space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow">
          <h1 className="text-xl font-semibold">¡Hola, {user.email}!</h1>
          <p className="text-sm text-gray-600">
            Plan: <b>{profile?.plan ?? "free"}</b> · Activo hasta:{" "}
            <b>
              {profile?.active_until
                ? new Date(profile.active_until).toLocaleDateString("es-ES")
                : "—"}
            </b>
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h2 className="font-semibold mb-2">Tus agentes</h2>
          {!agents?.length && (
            <p className="text-sm text-gray-500">
              Aún no tienes agentes. Crea uno en “Agentes”.
            </p>
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
                    <div className="text-xs text-gray-500">
                      Límite mensajes: {a.messages_limit ?? 1000}
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
      </div>

      <div className="space-y-4">
        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="font-semibold mb-2">Snippet de incrustación</h3>
          <p className="text-xs text-gray-600 mb-2">
            Pega esto en tu WordPress (footer o widget HTML). Cambia{" "}
            <code>AGENT_API_KEY</code> por la key del agente.
          </p>
          <pre className="text-xs bg-gray-900 text-green-200 p-3 rounded-lg overflow-auto">
            {`<script>
  (function(){
    var s=document.createElement('script');
    s.src='https://tu-dominio.com/widget.js?key=AGENT_API_KEY';
    s.defer=true; document.head.appendChild(s);
  })();
</script>`}
          </pre>
          <p className="mt-2 text-xs text-gray-500">
            Tu widget validará el plan y límites en el backend.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow">
          <h3 className="font-semibold mb-2">Plan & facturación</h3>
          <a
            className="inline-block text-sm bg-black text-white px-3 py-2 rounded-lg"
            href="/billing"
          >
            Cambiar/activar plan
          </a>
        </div>
      </div>
    </section>
  );
}
