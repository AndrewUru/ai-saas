"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useI18n } from "@/lib/i18n/client";
import { format } from "@/lib/i18n/config";
import { rotateAgentApiKey } from "./actions";

type RotateApiKeyButtonProps = {
  agentId: string;
};

export default function RotateApiKeyButton({
  agentId,
}: RotateApiKeyButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const { t } = useI18n();
  const r = t.agentPages.rotate;

  function rotate() {
    setNotice(null);
    setError(null);
    startTransition(async () => {
      const result = await rotateAgentApiKey(agentId);
      if (!result.ok) {
        setError(result.error);
        return;
      }

      setConfirming(false);
      setNotice(format(r.newKey, { suffix: result.apiKeySuffix }));
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div className="mt-4 rounded-2xl border border-amber-400/25 bg-amber-400/10 p-4 text-xs text-amber-100">
        <p className="leading-5">
          {r.warning}
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={rotate}
            disabled={isPending}
            className="rounded-full bg-amber-300 px-4 py-2 font-semibold text-slate-950 transition hover:bg-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? r.rotating : r.confirm}
          </button>
          <button
            type="button"
            onClick={() => setConfirming(false)}
            disabled={isPending}
            className="rounded-full border border-amber-300/30 px-4 py-2 font-semibold text-amber-100 transition hover:border-amber-200 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {r.cancel}
          </button>
        </div>
        {error && <p className="mt-3 text-rose-200">{error}</p>}
      </div>
    );
  }

  return (
    <div className="mt-4 space-y-3">
      <button
        type="button"
        onClick={() => {
          setConfirming(true);
          setNotice(null);
          setError(null);
        }}
        className="ui-button ui-button--ghost w-full text-xs"
      >
        {r.button}
      </button>
      {notice && <p className="text-xs text-neutral-200">{notice}</p>}
      {error && <p className="text-xs text-rose-200">{error}</p>}
    </div>
  );
}
