import Link from "next/link";
import {
  BarChart3,
  Bot,
  CheckCircle2,
  Code2,
  Database,
  Globe2,
  KeyRound,
  LifeBuoy,
  MessageSquare,
  Palette,
  PlugZap,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { format } from "@/lib/i18n/config";
import type { Messages } from "@/lib/i18n/messages";
import { rich } from "@/lib/i18n/rich";
import { getI18n } from "@/lib/i18n/server";

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
};

const FEATURE_DEFS: {
  key: keyof Messages["docs"]["features"];
  icon: LucideIcon;
  href?: string;
}[] = [
  { key: "agents", icon: Bot, href: "/dashboard/agents" },
  { key: "knowledge", icon: Database },
  { key: "widget", icon: Palette },
  { key: "simulator", icon: MessageSquare },
  { key: "integrations", icon: PlugZap, href: "/dashboard/integrations" },
  { key: "analytics", icon: BarChart3 },
  { key: "domains", icon: ShieldCheck },
  { key: "rotation", icon: KeyRound },
];

function FeatureCard({ feature }: { feature: Feature }) {
  const Icon = feature.icon;
  const content = (
    <>
      <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
        <Icon className="h-4 w-4" aria-hidden="true" />
      </div>
      <h3 className="mt-5 text-base font-semibold text-white">
        {feature.title}
      </h3>
      <p className="mt-3 text-sm leading-6 text-zinc-400">
        {feature.description}
      </p>
    </>
  );

  if (!feature.href) {
    return (
      <article className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
        {content}
      </article>
    );
  }

  return (
    <Link
      href={feature.href}
      className="rounded-lg border border-white/10 bg-white/[0.03] p-5 transition hover:border-accent/30 hover:bg-white/[0.05]"
    >
      {content}
    </Link>
  );
}

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-6 text-neutral-200">
      <code>{children}</code>
    </pre>
  );
}

export default async function DocsPage() {
  const { t } = await getI18n();
  const d = t.docs;
  const features: Feature[] = FEATURE_DEFS.map(({ key, ...def }) => ({
    ...def,
    ...d.features[key],
  }));
  const installSteps = d.installSteps;
  const troubleshooting = d.troubleshooting;

  return (
    <div className="space-y-8">
      <header className="rounded-lg border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="ui-badge">{d.badge}</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {d.title}
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
              {d.intro}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/agents" className="ui-button ui-button--primary">
              {d.openAgents}
            </Link>
            <Link
              href="/dashboard/integrations"
              className="ui-button ui-button--secondary"
            >
              {d.connectStore}
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {d.highlights.map((item) => (
          <div
            key={item}
            className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-4"
          >
            <CheckCircle2
              className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              aria-hidden="true"
            />
            <p className="text-sm leading-6 text-zinc-300">{item}</p>
          </div>
        ))}
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {d.modulesEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            {d.modulesTitle}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <FeatureCard key={feature.title} feature={feature} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
              <Code2 className="h-4 w-4" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                {d.installEyebrow}
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                {d.installTitle}
              </h2>
            </div>
          </div>

          <ol className="mt-6 grid gap-4 sm:grid-cols-2">
            {installSteps.map((step, index) => (
              <li
                key={step.title}
                className="rounded-lg border border-white/10 bg-black/20 p-4"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                  {format(d.step, { n: index + 1 })}
                </span>
                <h3 className="mt-2 text-sm font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-zinc-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-6 space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-white">
                {d.htmlTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {d.htmlBody}
              </p>
            </div>
            <CodeBlock>
              {'<script async src="https://agentes.elsaltoweb.es/api/widget?key=YOUR_AGENT_KEY"></script>'}
            </CodeBlock>

            <div>
              <h3 className="text-sm font-semibold text-white">
                {d.nextTitle}
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                {d.nextBody}
              </p>
            </div>
            <CodeBlock>
              {`import Script from "next/script";

export function WidgetScript() {
  return (
    <Script
      src="https://agentes.elsaltoweb.es/api/widget?key=YOUR_AGENT_KEY"
      strategy="afterInteractive"
    />
  );
}`}
            </CodeBlock>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center gap-3">
              <Globe2 className="h-5 w-5 text-accent" aria-hidden="true" />
              <h2 className="text-base font-semibold text-white">
                {d.domainTitle}
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {rich(d.domainExact, {
                root: <code>example.com</code>,
                sub: <code>app.example.com</code>,
              })}
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              {rich(d.domainWildcard, { wildcard: <code>*.example.com</code> })}
            </p>
          </div>

          <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-5 text-amber-100">
            <h2 className="text-base font-semibold">{d.checklistTitle}</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              {d.checklist.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start gap-3">
          <LifeBuoy className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              {d.troubleEyebrow}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              {d.troubleTitle}
            </h2>
          </div>
        </div>

        <div className="mt-6 divide-y divide-white/10 overflow-hidden rounded-lg border border-white/10">
          {troubleshooting.map((item) => (
            <div
              key={item.issue}
              className="grid gap-2 bg-black/15 p-4 sm:grid-cols-[220px_1fr]"
            >
              <h3 className="text-sm font-semibold text-white">
                {item.issue}
              </h3>
              <p className="text-sm leading-6 text-zinc-400">{item.fix}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/contact" className="ui-button ui-button--primary">
            {d.contactSupport}
          </Link>
          <Link href="/academy" className="ui-button ui-button--secondary">
            {d.readAcademy}
          </Link>
        </div>
      </section>
    </div>
  );
}
