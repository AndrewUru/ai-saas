"use client";

import { useFormStatus } from "react-dom";

type SubmitButtonProps = {
  label: string;
  className?: string;
};

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function SubmitButton({ label, className }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      aria-disabled={pending}
      aria-busy={pending}
      className={cx(
        "inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 active:scale-[0.98] sm:w-auto",
        "disabled:cursor-not-allowed disabled:bg-emerald-400/60 disabled:text-slate-950/60 disabled:hover:bg-emerald-400/60",
        className
      )}
    >
      {pending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
          aria-hidden="true"
        />
      )}
      <span>{pending ? "Saving\u2026" : label}</span>
    </button>
  );
}
