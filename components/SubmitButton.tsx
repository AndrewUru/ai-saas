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
        "ui-button ui-button--primary w-full sm:w-auto",
        "disabled:cursor-not-allowed disabled:opacity-60",
        className,
      )}
      data-oid="fj3-1bw"
    >
      {pending && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900/30 border-t-slate-900"
          aria-hidden="true"
          data-oid="96rc:ol"
        />
      )}
      <span data-oid=":8wy4dg">{pending ? "Saving\u2026" : label}</span>
    </button>
  );
}
