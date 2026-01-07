"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type Props = {
  apiKey: string;
  // opcional: por si algún día quieres mostrar el origin en UI,
  // pero por defecto mantenemos el snippet estable con prod.
  siteUrl?: string;
};

export default function EmbedSnippet({ apiKey }: Props) {
  const [copied, setCopied] = useState(false);

  const snippet = useMemo(() => {
    // ✅ Keep this stable for customers (do NOT use localhost/staging here)
    const WIDGET_ORIGIN = "https://agentes.elsaltoweb.es";
    const widgetSrc = `${WIDGET_ORIGIN}/api/widget?key=${encodeURIComponent(
      apiKey
    )}`;

    return `
<script>
(function () {
  var s = document.createElement("script");
  s.src = "${widgetSrc}";
  s.async = true;
  s.defer = true;
  s.onerror = function () {
    console.error("[AI Commerce] Widget failed to load");
  };
  document.head.appendChild(s);
})();
</script>
    `.trim();
  }, [apiKey]);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-white">Embed snippet</h3>

        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-emerald-400 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-emerald-300"
        >
          {copied ? "Copied ✓" : "Copy code"}
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-300">
        Copy and paste this script into your WordPress (footer or HTML widget).
        This snippet is stable: you don&apos;t need to update it when you change
        settings.
      </p>

      <pre className="mt-4 max-h-64 overflow-auto rounded-2xl bg-slate-950/80 p-4 text-[11px] leading-relaxed text-emerald-200 whitespace-pre-wrap">
        {snippet}
      </pre>

      <p className="mt-3 text-xs text-slate-500">
        The widget checks your active plan and usage limits before loading.
      </p>

      {/* ⚠️ NEXT / REACT NOTICE */}
      <div className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs text-amber-200">
        <strong>React / Next.js:</strong>
        <br />
        Do not paste this script directly inside React components. Use the
        official integration method described in the{" "}
        <Link
          href="/docs/nextjs"
          className="underline font-semibold hover:text-amber-100"
        >
          documentation
        </Link>
        .
      </div>
    </article>
  );
}
