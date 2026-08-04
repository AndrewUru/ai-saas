"use client";

import { Sparkles } from "lucide-react";
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
      {pending ? (
        <span className="ui-button-loader" aria-hidden="true">
          <Sparkles className="h-3.5 w-3.5" />
        </span>
      ) : null}
      <span data-oid=":8wy4dg">{pending ? "Saving\u2026" : label}</span>
    </button>
  );
}
