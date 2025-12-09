import Link from "next/link";

const navigation = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/#features" },
      { label: "Agents", href: "/agents" },
      { label: "Pricing", href: "/billing" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Academy", href: "/academy" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About us", href: "/about" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

const social = [
  { label: "Instagram", href: "https://instagram.com" },
  { label: "LinkedIn", href: "https://linkedin.com" },
  { label: "YouTube", href: "https://youtube.com" },
];

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-900 bg-slate-950/95 text-slate-300">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12 px-6 py-12 sm:px-10 lg:px-16">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_repeat(3,minmax(140px,1fr))]">
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-emerald-300">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-emerald-500/40 bg-emerald-500/10 text-sm font-bold">
                AI
              </span>
              <span className="text-sm font-semibold uppercase tracking-[0.28em]">
                Commerce Agents
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Support agents trained for e-commerce. Connect WooCommerce,
              automate responses, and scale without losing control.
            </p>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500">
              {social.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                  className="transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </div>

          {navigation.map((section) => (
            <div key={section.title}>
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-500">
                {section.title}
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-300">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 border-t border-slate-900 pt-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright {year} AI-SaaS. All rights reserved.</p>
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/privacy"
              className="transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Privacy Policy
            </Link>
            <span className="h-1 w-1 rounded-full bg-slate-700" />

            <Link
              href="/terms"
              className="transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Terms of Service
            </Link>
            <span className="h-1 w-1 rounded-full bg-slate-700" />

            <a
              href="mailto:atobio459@gmail.com"
              className="transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              atobio459@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
