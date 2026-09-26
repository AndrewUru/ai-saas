import Image from "next/image";

export type AuthStatusValue = {
  intent: "info" | "success" | "error";
  message: string;
} | null;

export const authInputClassName =
  "h-13 w-full rounded-2xl border border-white/[0.09] bg-white/[0.045] px-4 text-sm text-zinc-100 outline-none transition placeholder:text-zinc-600 hover:border-white/[0.14] focus:border-violet-400/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-violet-500/10";

export const authPrimaryButtonClassName =
  "inline-flex h-13 w-full items-center justify-center gap-2 rounded-2xl border border-violet-300/15 bg-gradient-to-br from-violet-500 to-violet-700 px-4 text-sm font-semibold text-white shadow-[0_14px_34px_rgba(109,40,217,0.24)] transition hover:-translate-y-0.5 hover:from-violet-400 hover:to-violet-600 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0";

export const authSecondaryButtonClassName =
  "inline-flex h-13 w-full items-center justify-center gap-3 rounded-2xl border border-white/[0.09] bg-white/[0.035] px-4 text-sm font-semibold text-zinc-200 transition hover:border-white/[0.16] hover:bg-white/[0.07] disabled:cursor-not-allowed disabled:opacity-50";

export function GoogleAuthButton({
  disabled,
  label,
  onClick,
}: {
  disabled?: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={authSecondaryButtonClassName}
    >
      <Image
        src="/google.svg"
        alt=""
        width={19}
        height={19}
        className="h-[19px] w-[19px]"
        aria-hidden="true"
      />
      {label}
    </button>
  );
}

export function AuthDivider({ label = "o continúa con" }: { label?: string }) {
  return (
    <div className="my-6 flex items-center gap-4 text-[11px] font-medium text-zinc-600">
      <span className="h-px flex-1 bg-white/[0.08]" />
      {label}
      <span className="h-px flex-1 bg-white/[0.08]" />
    </div>
  );
}

export function AuthStatus({ status }: { status: AuthStatusValue }) {
  if (!status) return null;

  const className =
    status.intent === "success"
      ? "border-emerald-400/20 bg-emerald-400/[0.07] text-emerald-200"
      : status.intent === "error"
        ? "border-rose-400/25 bg-rose-400/[0.08] text-rose-200"
        : "border-white/[0.09] bg-white/[0.04] text-zinc-300";

  return (
    <p
      className={`mt-5 rounded-2xl border px-4 py-3 text-sm leading-5 ${className}`}
      role="status"
      aria-live="polite"
    >
      {status.message}
    </p>
  );
}

