import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth/requireUser";
import { format } from "@/lib/i18n/config";
import { getI18n } from "@/lib/i18n/server";
import EmbedSnippet from "../EmbedSnippet";
import RotateApiKeyButton from "../RotateApiKeyButton";

export default async function AgentInstallPage({
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
    .select("id, name, api_key, allowed_domains")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !agent) return notFound();

  return (
    <div className="space-y-6">
      <header className="ui-card--strong p-6">
        <p className="ui-badge">{ap.installPage.badge}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {format(ap.installPage.title, { name: agent.name })}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">
              {ap.installPage.intro}
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

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0 space-y-4">
          <EmbedSnippet apiKey={agent.api_key} />
          <RotateApiKeyButton agentId={agent.id} />
        </div>

        <aside className="ui-card glass-pane p-6">
          <h2 className="text-lg font-semibold text-white">{ap.installPage.notesTitle}</h2>
          <div className="mt-4 space-y-3 text-sm text-slate-400">
            <p className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
              {ap.installPage.noteScript}
            </p>
            <p className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
              {ap.installPage.allowedDomains}{" "}
              <span className="text-slate-200">
                {agent.allowed_domains?.length
                  ? agent.allowed_domains.join(", ")
                  : ap.installPage.anyOrigin}
              </span>
            </p>
            <p className="rounded-xl border border-slate-800 bg-slate-950/35 p-3">
              {ap.installPage.noteRefresh}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
