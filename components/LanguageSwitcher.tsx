"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { useI18n } from "@/lib/i18n/client";
import { LOCALE_COOKIE, locales, type Locale } from "@/lib/i18n/config";

export default function LanguageSwitcher({
  className = "",
}: {
  className?: string;
}) {
  const { locale, t } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function change(next: Locale) {
    if (next === locale) return;
    const maxAge = 60 * 60 * 24 * 365;
    document.cookie = `${LOCALE_COOKIE}=${next}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
    startTransition(() => router.refresh());
  }

  return (
    <div
      role="group"
      aria-label={t.language.label}
      className={`inline-flex items-center rounded-full border border-slate-700/60 bg-slate-900/40 p-0.5 text-xs font-semibold ${
        isPending ? "opacity-60" : ""
      } ${className}`}
    >
      {locales.map((code) => {
        const active = code === locale;
        return (
          <button
            key={code}
            type="button"
            onClick={() => change(code)}
            disabled={isPending}
            aria-pressed={active}
            title={t.language.switchTo}
            className={`rounded-full px-2.5 py-1 uppercase transition ${
              active
                ? "bg-neutral-500 text-slate-950"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            {code}
          </button>
        );
      })}
    </div>
  );
}
