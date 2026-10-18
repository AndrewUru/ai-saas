"use client";

import { useState } from "react";
import Link from "next/link";
import { useI18n } from "@/lib/i18n/client";
import { rich } from "@/lib/i18n/rich";
import { getEmbedSnippet } from "@/lib/widget/embedSnippet";

type Props = {
  apiKey: string;
};

export default function EmbedSnippet({ apiKey }: Props) {
  const [copied, setCopied] = useState(false);
  const { t } = useI18n();
  const e = t.agentPages.embed;

  const snippet = getEmbedSnippet(apiKey);

  const copy = async () => {
    await navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <article
      className="rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur"
      data-oid="wpx.3ne"
    >
      <div
        className="flex items-center justify-between gap-4"
        data-oid="w-j2-ih"
      >
        <h3 className="text-lg font-semibold text-white" data-oid="1csi-4o">
          {e.title}
        </h3>

        <button
          type="button"
          onClick={copy}
          className="rounded-full bg-neutral-400 px-4 py-1.5 text-xs font-semibold text-slate-950 transition hover:bg-neutral-300"
          data-oid="37itwtt"
        >
          {copied ? e.copied : e.copy}
        </button>
      </div>

      <p className="mt-2 text-sm text-slate-300" data-oid="-x0.ex:">
        {e.intro}
      </p>

      <pre
        className="mt-4 max-h-64 overflow-auto rounded-2xl bg-slate-950/80 p-4 text-[11px] leading-relaxed text-neutral-200 whitespace-pre-wrap"
        data-oid="flh5:kq"
      >
        {snippet}
      </pre>

      <p className="mt-3 text-xs text-slate-500" data-oid="wl4ik4k">
        {e.planCheck}
      </p>

      {/* NEXT / REACT NOTICE */}
      <div
        className="mt-4 rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4 text-xs text-amber-200"
        data-oid="fpr-0j8"
      >
        <strong data-oid="xeocbbo">{e.reactTitle}</strong>
        <br data-oid="kwlnfq3" />
        {rich(e.reactBody, {
          link: (
            <Link
              href="/dashboard/docs"
              className="underline font-semibold hover:text-amber-100"
              data-oid="bk:9hdw"
            >
              {e.docsLink}
            </Link>
          ),
        })}
      </div>
    </article>
  );
}
