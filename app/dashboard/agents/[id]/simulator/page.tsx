import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { format } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import AgentSimulator from "../AgentSimulator";

export default async function AgentSimulatorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { supabase, user } = await requireUser();
  const { t } = await getI18n();
  const ap = t.agentPages;
  const { data: agent, error } = await supabase
    .from("agents")
    .select("id, name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !agent) return notFound();

  return (
    <div className="space-y-6">
      <header className="ui-card--strong p-6">
        <p className="ui-badge">{ap.simulatorPage.badge}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {format(ap.simulatorPage.title, { name: agent.name })}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {ap.simulatorPage.intro}
            </p>
          </div>
          <Link
            href={`/dashboard/agents/${agent.id}`}
            className="ui-button ui-button--ghost"
          >
            {ap.backToSetup}
          </Link>
        </div>
      </header>

      <AgentSimulator agentId={agent.id} />
    </div>
  );
}
