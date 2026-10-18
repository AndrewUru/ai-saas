"use client";

import { Sparkles } from "lucide-react";

import { useI18n } from "@/lib/i18n/client";
import type { Messages } from "@/lib/i18n/messages";

export function AiPulse({
  label,
  compact = false,
}: {
  label?: string;
  compact?: boolean;
}) {
  const { t } = useI18n();

  return (
    <div
      className={compact ? "ui-ai-loader ui-ai-loader--compact" : "ui-ai-loader"}
      role="status"
      aria-live="polite"
    >
      <span className="ui-ai-orb" aria-hidden="true">
        <Sparkles className="h-4 w-4" />
      </span>
      <span>{label ?? t.loading.default}</span>
    </div>
  );
}

export function PageLoading({
  labelKey = "default",
}: {
  labelKey?: keyof Messages["loading"];
}) {
  const { t } = useI18n();
  const label = t.loading[labelKey];

  return (
    <main className="mx-auto min-h-[70vh] max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="ui-card--strong overflow-hidden p-6 sm:p-8">
        <AiPulse label={label} />
        <div className="mt-8 space-y-4" aria-hidden="true">
          <div className="ui-skeleton h-9 max-w-xl rounded-xl" />
          <div className="ui-skeleton h-4 max-w-2xl rounded-lg" />
          <div className="ui-skeleton h-4 max-w-lg rounded-lg" />
        </div>
      </div>
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3" aria-hidden="true">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="ui-card p-5">
            <div className="ui-skeleton h-10 w-10 rounded-xl" />
            <div className="ui-skeleton mt-6 h-5 w-2/3 rounded-lg" />
            <div className="ui-skeleton mt-4 h-3 w-full rounded-lg" />
            <div className="ui-skeleton mt-2 h-3 w-4/5 rounded-lg" />
          </div>
        ))}
      </div>
    </main>
  );
}
