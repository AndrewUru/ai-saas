"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

type ServerAction = (formData: FormData) => Promise<void> | void;

type IntegrationSummary = {
  id: string;
  is_active: boolean;
  last_sync_status: string | null;
  last_sync_error: string | null;
  last_sync_at: string | null;
  products_indexed_count: number | null;
};

type SyncControlsProps = {
  integration: IntegrationSummary;
  formattedLastSync: string;
  webhookUrl: string | null;
  statusParam: string | null;
  errorParam: string | null;
  syncTargetId: string | null;
  onToggle: ServerAction;
  onSync: ServerAction;
  onTest: ServerAction;
  onDelete: ServerAction;
};

type PendingButtonProps = {
  label: string;
  pendingLabel?: string;
  disabled?: boolean;
  onPendingChange?: (pending: boolean) => void;
  className?: string;
};

function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={[
        "inline-flex h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-hidden="true"
    />
  );
}

function PendingButton({
  label,
  pendingLabel,
  disabled,
  onPendingChange,
  className,
}: PendingButtonProps) {
  const { pending } = useFormStatus();

  useEffect(() => {
    onPendingChange?.(pending);
  }, [pending, onPendingChange]);

  return (
    <button
      type="submit"
      className={className}
      disabled={disabled || pending}
      aria-disabled={disabled || pending}
    >
      <span className="inline-flex items-center gap-2">
        {pending && <Spinner />}
        {pending ? pendingLabel ?? label : label}
      </span>
    </button>
  );
}

export default function SyncControls({
  integration,
  formattedLastSync,
  webhookUrl,
  statusParam,
  errorParam,
  syncTargetId,
  onToggle,
  onSync,
  onTest,
  onDelete,
}: SyncControlsProps) {
  const router = useRouter();
  const [isSyncing, setIsSyncing] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState(0);
  const wasSyncingRef = useRef(false);

  const globalDisabled = isSyncing || isTesting;
  const syncStatusLabel = useMemo(() => {
    if (isSyncing) return "Syncing...";
    if (integration.last_sync_status === "running") return "Syncing...";
    return integration.last_sync_status ?? "Not synced";
  }, [integration.last_sync_status, isSyncing]);

  const shouldShowToast =
    syncTargetId === integration.id &&
    (statusParam === "sync_ok" || errorParam === "sync_failed");

  const toastText =
    statusParam === "sync_ok"
      ? `Products imported: ${integration.products_indexed_count ?? 0}.`
      : "Sync failed. Review the error details and retry.";

  const toastTone =
    statusParam === "sync_ok"
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100"
      : "border-rose-500/40 bg-rose-500/10 text-rose-100";

  const syncLabel =
    integration.last_sync_status === "failed" ? "Retry sync" : "Sync products now";

  useEffect(() => {
    if (!isSyncing) return;
    wasSyncingRef.current = true;
    setProgress(6);
    const interval = setInterval(() => {
      setProgress((current) => {
        if (current >= 90) return current;
        const increment = Math.random() * 4 + 1;
        return Math.min(90, current + increment);
      });
    }, 900);
    return () => clearInterval(interval);
  }, [isSyncing]);

  useEffect(() => {
    if (isSyncing) return;
    if (!wasSyncingRef.current) return;
    setProgress(100);
    const timeout = setTimeout(() => setProgress(0), 1200);
    wasSyncingRef.current = false;
    router.refresh();
    return () => clearTimeout(timeout);
  }, [isSyncing, router]);

  useEffect(() => {
    if (!isSyncing) return;
    const interval = setInterval(() => {
      router.refresh();
    }, 2500);
    return () => clearInterval(interval);
  }, [isSyncing, router]);

  const progressVisible = isSyncing || progress > 0;

  return (
    <>
      <div
        className="grid gap-3 rounded-xl border border-slate-800/60 bg-slate-900/40 p-4 text-xs text-slate-300"
        aria-busy={isSyncing}
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Sync status
          </span>
          <span className="text-xs font-semibold text-white">
            {syncStatusLabel}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Products indexed
          </span>
          <span className="text-xs font-semibold text-white">
            {integration.products_indexed_count ?? 0}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
            Last sync
          </span>
          <span className="text-xs font-semibold text-white">
            {formattedLastSync}
          </span>
        </div>

        {isSyncing && (
          <div className="space-y-2" role="status" aria-live="polite">
            <div className="flex items-center gap-2 text-emerald-200">
              <Spinner />
              <span className="text-xs font-semibold">Syncing...</span>
            </div>
            <p className="text-xs text-slate-400">
              Importing products from Shopify to Supabase. This can take a few
              minutes.
            </p>
          </div>
        )}

        {progressVisible && (
          <div className="space-y-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/80">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Estimated progress {Math.round(progress)}%
            </p>
          </div>
        )}

        {shouldShowToast && (
          <div
            className={[
              "rounded-lg border px-3 py-2 text-xs font-semibold",
              toastTone,
            ].join(" ")}
            role="status"
          >
            {toastText}
          </div>
        )}

        {integration.last_sync_error && (
          <p
            className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200"
            role="alert"
          >
            {integration.last_sync_error}
          </p>
        )}

        {webhookUrl && (
          <div className="rounded-lg border border-slate-800/60 bg-slate-950/60 px-3 py-2">
            <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500">
              Webhook URL
            </p>
            <p className="mt-1 break-all font-mono text-[11px] text-emerald-200">
              {webhookUrl}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3 text-xs">
        <form action={onToggle}>
          <input type="hidden" name="integration_id" value={integration.id} />
          <input
            type="hidden"
            name="state"
            value={integration.is_active ? "deactivate" : "activate"}
          />
          <PendingButton
            label={integration.is_active ? "Pause" : "Activate"}
            disabled={globalDisabled}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>

        <form action={onTest}>
          <input type="hidden" name="integration_id" value={integration.id} />
          <PendingButton
            label="Test connection"
            pendingLabel="Testing..."
            disabled={globalDisabled}
            onPendingChange={setIsTesting}
            className="inline-flex items-center justify-center rounded-full border border-slate-700 px-4 py-2 font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>

        <form action={onSync}>
          <input type="hidden" name="integration_id" value={integration.id} />
          <PendingButton
            label={syncLabel}
            pendingLabel="Syncing..."
            disabled={globalDisabled}
            onPendingChange={setIsSyncing}
            className="inline-flex items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-2 font-semibold text-emerald-200 transition hover:border-emerald-400/70 hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>

        <form action={onDelete}>
          <input type="hidden" name="integration_id" value={integration.id} />
          <PendingButton
            label="Delete"
            disabled={globalDisabled}
            className="inline-flex items-center justify-center rounded-full border border-rose-500/40 px-4 py-2 font-semibold text-rose-200 transition hover:border-rose-400 hover:text-rose-100 disabled:cursor-not-allowed disabled:opacity-60"
          />
        </form>
      </div>
    </>
  );
}
