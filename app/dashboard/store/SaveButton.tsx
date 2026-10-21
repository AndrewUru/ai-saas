"use client";

import { useFormStatus } from "react-dom";

export default function SaveButton({
  label,
  pending,
}: {
  label: string;
  pending: string;
}) {
  const status = useFormStatus();
  return (
    <button
      disabled={status.pending}
      aria-busy={status.pending}
      className="rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background disabled:opacity-50"
    >
      {status.pending ? pending : label}
    </button>
  );
}
