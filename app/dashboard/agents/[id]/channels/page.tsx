import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2, MessageCircle, ShieldCheck } from "lucide-react";
import SubmitButton from "@/components/SubmitButton";
import { requireUser } from "@/lib/auth/requireUser";
import { format, intlLocales } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { getI18n } from "@/lib/i18n/server";
import { connectTelegram, disconnectChannel, setChannelActive } from "./actions";

type ChannelRow = {
  id: string;
  type: string;
  display_name: string | null;
  is_active: boolean;
  last_error: string | null;
  last_message_at: string | null;
};

type ChannelsCopy = Messages["channels"];

function pickParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function AgentChannelsPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const query = await searchParams;
  const { supabase, user } = await requireUser();
  const { locale, t } = await getI18n();
  const c = t.channels;

  const [{ data: agent }, { data: channels }] = await Promise.all([
    supabase
      .from("agents")
      .select("id, name")
      .eq("id", id)
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("agent_channels")
      .select("id, type, display_name, is_active, last_error, last_message_at")
      .eq("agent_id", id)
      .order("created_at", { ascending: true })
      .returns<ChannelRow[]>(),
  ]);

  if (!agent) return notFound();

  const telegram = (channels ?? []).find((channel) => channel.type === "telegram");
  const statusKey = pickParam(query.status);
  const errorKey = pickParam(query.error);
  const statusText =
    statusKey && Object.hasOwn(c.status, statusKey)
      ? c.status[statusKey as keyof ChannelsCopy["status"]]
      : null;
  const errorText =
    errorKey && Object.hasOwn(c.errors, errorKey)
      ? c.errors[errorKey as keyof ChannelsCopy["errors"]]
      : null;
  const formatDate = (value: string) =>
    new Intl.DateTimeFormat(intlLocales[locale], {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));

  return (
    <div className="space-y-6">
      <header className="ui-card--strong p-6">
        <p className="ui-badge">{c.badge}</p>
        <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-white">
              {format(c.title, { name: agent.name })}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">{c.intro}</p>
          </div>
          <Link href={`/dashboard/agents/${agent.id}`} className="ui-button ui-button--ghost">
            {t.agentPages.backToSetup}
          </Link>
        </div>
      </header>

      {statusText || errorText ? (
        <div
          role={errorText ? "alert" : "status"}
          className={
            errorText
              ? "flex items-start gap-3 rounded-2xl border border-rose-500/35 bg-rose-500/10 px-4 py-3 text-sm text-rose-100"
              : "flex items-start gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
          }
        >
          {errorText ? (
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          )}
          <span>{errorText ?? statusText}</span>
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="ui-card p-6">
          <ChannelHeading
            name={c.telegram.name}
            description={c.telegram.description}
            badge={
              telegram
                ? { label: telegram.is_active ? c.connected : c.paused, active: telegram.is_active }
                : { label: c.notConnected, active: false }
            }
          />

          {telegram ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-xl border border-border bg-surface/30 p-4 text-sm">
                <p className="font-semibold text-foreground">{telegram.display_name}</p>
                <p className="mt-1 text-xs text-[var(--foreground-muted)]">
                  {telegram.last_message_at
                    ? format(c.lastMessage, { date: formatDate(telegram.last_message_at) })
                    : c.noMessagesYet}
                </p>
                {telegram.last_error ? (
                  <p className="mt-3 rounded-lg border border-rose-500/30 bg-rose-500/10 p-2 text-xs text-rose-100">
                    {format(c.lastError, { error: telegram.last_error })}
                  </p>
                ) : null}
              </div>

              <div className="flex flex-wrap gap-2">
                {telegram.display_name?.startsWith("@") ? (
                  <a
                    href={`https://t.me/${telegram.display_name.slice(1)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ui-button ui-button--secondary text-sm"
                  >
                    {c.telegram.openBot}
                  </a>
                ) : null}
                <form action={setChannelActive}>
                  <input type="hidden" name="agent_id" value={agent.id} />
                  <input type="hidden" name="channel_id" value={telegram.id} />
                  <input type="hidden" name="active" value={String(!telegram.is_active)} />
                  <button type="submit" className="ui-button ui-button--secondary text-sm">
                    {telegram.is_active ? c.pause : c.resume}
                  </button>
                </form>
                <form action={disconnectChannel}>
                  <input type="hidden" name="agent_id" value={agent.id} />
                  <input type="hidden" name="channel_id" value={telegram.id} />
                  <button
                    type="submit"
                    className="ui-button ui-button--subtle text-sm text-rose-200 hover:text-rose-100"
                  >
                    {c.disconnect}
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="mt-5 space-y-4">
              <ol className="space-y-2 text-sm text-[var(--foreground-muted)]">
                {c.telegram.steps.map((step, index) => (
                  <li key={step} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border bg-surface text-xs font-semibold text-foreground">
                      {index + 1}
                    </span>
                    <span className="pt-0.5">{step}</span>
                  </li>
                ))}
              </ol>
              <form action={connectTelegram} className="space-y-3">
                <input type="hidden" name="agent_id" value={agent.id} />
                <label htmlFor="telegram-token" className="block text-sm font-medium text-foreground">
                  {c.telegram.tokenLabel}
                </label>
                <input
                  id="telegram-token"
                  name="token"
                  type="password"
                  required
                  autoComplete="off"
                  spellCheck={false}
                  placeholder={c.telegram.tokenPlaceholder}
                  className="ui-input font-mono text-sm"
                />
                <SubmitButton label={c.telegram.connect} />
              </form>
            </div>
          )}
        </section>

        <div className="grid gap-4">
          {(["whatsapp", "instagram", "messenger"] as const).map((key) => (
            <section key={key} className="ui-card p-6 opacity-80">
              <ChannelHeading
                name={c.upcoming[key].name}
                description={c.upcoming[key].description}
                badge={{ label: c.comingSoon, active: false }}
              />
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function ChannelHeading({
  name,
  description,
  badge,
}: {
  name: string;
  description: string;
  badge: { label: string; active: boolean };
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 items-start gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-background text-[var(--foreground-muted)]">
          <MessageCircle className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-foreground">{name}</h2>
          <p className="mt-1 text-sm text-[var(--foreground-muted)]">{description}</p>
        </div>
      </div>
      <span
        className={
          badge.active
            ? "shrink-0 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-200"
            : "shrink-0 rounded-full border border-border bg-surface px-2.5 py-0.5 text-xs font-semibold text-[var(--foreground-muted)]"
        }
      >
        {badge.label}
      </span>
    </div>
  );
}
