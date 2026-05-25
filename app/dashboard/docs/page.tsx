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

type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
  href?: string;
};

const features: Feature[] = [
  {
    icon: Bot,
    title: "Agents",
    description:
      "Create one assistant per store or client. Each agent has its own API key, knowledge base, widget settings, allowed domains, simulator and analytics.",
    href: "/dashboard/agents",
  },
  {
    icon: Database,
    title: "Knowledge",
    description:
      "Upload store context, policies, FAQs, catalog notes and internal answers so the assistant can respond with approved information instead of guessing.",
  },
  {
    icon: Palette,
    title: "Widget studio",
    description:
      "Customize brand name, greeting, launcher text, colors, chat bubbles, header, position and language. The preview updates before you publish.",
  },
  {
    icon: MessageSquare,
    title: "Simulator",
    description:
      "Test shopper questions before going live. Use it to validate refunds, shipping, product recommendations, edge cases and handoff behavior.",
  },
  {
    icon: PlugZap,
    title: "Integrations",
    description:
      "Connect WooCommerce or Shopify so the assistant can work with product and catalog context instead of static support copy only.",
    href: "/dashboard/integrations",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Review conversations, usage and friction signals. Use the data to spot missing answers, shopper objections and opportunities to improve the store.",
  },
  {
    icon: ShieldCheck,
    title: "Allowed domains",
    description:
      "Limit where each widget can load. This prevents a leaked script from being reused on unapproved domains or client sites.",
  },
  {
    icon: KeyRound,
    title: "API key rotation",
    description:
      "Rotate a widget key from the install screen if a snippet is exposed, a client contract ends or you want to revoke previous access.",
  },
];

const installSteps = [
  {
    title: "Create or open an agent",
    body: "Go to Agents, choose the store/client assistant, then review its knowledge, widget style and allowed domains.",
  },
  {
    title: "Copy the embed snippet",
    body: "Open the agent Install screen and copy the generated script. The snippet stays stable when you update widget settings.",
  },
  {
    title: "Paste before the closing body tag",
    body: "Use the footer/custom HTML area in WordPress, Shopify, Webflow or any site builder. In custom HTML, paste it before </body>.",
  },
  {
    title: "Verify and monitor",
    body: "Open the storefront, send a test message, then check analytics and simulator results before handing the store to the client.",
  },
];

const troubleshooting = [
  {
    issue: "Widget does not appear",
    fix: "Check that the script is installed once, the agent key is active and the current domain is allowed.",
  },
  {
    issue: "Browser console shows 403",
    fix: "The domain is not authorized. Add the exact domain or a wildcard such as *.example.com.",
  },
  {
    issue: "React or Next.js throws a script error",
    fix: "Do not paste the raw script inside JSX. Load it with a framework script loader.",
  },
  {
    issue: "The style did not update",
    fix: "Refresh the storefront and confirm the settings were saved on the agent widget screen.",
  },
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
    <pre className="overflow-auto rounded-lg border border-white/10 bg-black/40 p-4 text-xs leading-6 text-emerald-200">
      <code>{children}</code>
    </pre>
  );
}

export default function DocsPage() {
  return (
    <div className="space-y-8">
      <header className="rounded-lg border border-white/10 bg-white/[0.03] p-6 shadow-xl shadow-black/20">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-3xl">
            <p className="ui-badge">Documentation</p>
            <h1 className="mt-5 text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Product guide and widget installation
            </h1>
            <p className="mt-4 text-sm leading-6 text-zinc-400 sm:text-base">
              Use this page to understand what each dashboard area does, how the
              storefront widget is installed, and how to troubleshoot common
              launch issues for WooCommerce, Shopify, HTML and React/Next.js
              projects.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/agents" className="ui-button ui-button--primary">
              Open agents
            </Link>
            <Link
              href="/dashboard/integrations"
              className="ui-button ui-button--secondary"
            >
              Connect store
            </Link>
          </div>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          "Create an agent for each storefront.",
          "Train it with approved business knowledge.",
          "Install one secure script on the client site.",
        ].map((item) => (
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
            Dashboard functionality
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-white">
            What each module is for
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
                Installation
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-white">
                Publish the widget
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
                  Step {index + 1}
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
                Standard HTML, WordPress, Shopify or Webflow
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Paste the generated snippet into the footer, theme custom HTML,
                tag manager or immediately before the closing body tag.
              </p>
            </div>
            <CodeBlock>
              {'<script async src="https://agentes.elsaltoweb.es/api/widget?key=YOUR_AGENT_KEY"></script>'}
            </CodeBlock>

            <div>
              <h3 className="text-sm font-semibold text-white">
                Next.js example
              </h3>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                In React and Next.js, load the script with the framework loader
                instead of placing a raw script tag inside JSX.
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
                Domain security
              </h2>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Allowed domains are exact. <code>example.com</code> and{" "}
              <code>app.example.com</code> are different origins. Add each
              production, staging and client domain that should load the widget.
            </p>
            <p className="mt-3 text-sm leading-6 text-zinc-400">
              Use <code>*.example.com</code> when every subdomain should be
              valid. Keep the list empty only while testing locally or during a
              temporary setup window.
            </p>
          </div>

          <div className="rounded-lg border border-amber-400/20 bg-amber-400/10 p-5 text-amber-100">
            <h2 className="text-base font-semibold">Launch checklist</h2>
            <ul className="mt-3 space-y-2 text-sm leading-6">
              <li>Agent knowledge is approved.</li>
              <li>Allowed domains include the live store.</li>
              <li>Widget colors and copy match the brand.</li>
              <li>Simulator answers match support policy.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="rounded-lg border border-white/10 bg-white/[0.03] p-6">
        <div className="flex items-start gap-3">
          <LifeBuoy className="mt-1 h-5 w-5 text-accent" aria-hidden="true" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
              Troubleshooting
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-white">
              Common issues
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
            Contact support
          </Link>
          <Link href="/academy" className="ui-button ui-button--secondary">
            Read academy
          </Link>
        </div>
      </section>
    </div>
  );
}
