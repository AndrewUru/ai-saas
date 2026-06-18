import Link from "next/link";
import type { ReactNode } from "react";

type EmptyStateProps = {
  actionHref?: string;
  actionLabel?: string;
  description: string;
  icon?: ReactNode;
  title: string;
};

export function EmptyState({
  actionHref,
  actionLabel,
  description,
  icon,
  title,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/20 p-8 text-center sm:p-12">
      {icon ? (
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full border border-border bg-surface text-accent">
          {icon}
        </div>
      ) : null}
      <h3 className="text-base font-semibold text-foreground">{title}</h3>
      <p className="mt-2 max-w-sm text-sm leading-6 text-[var(--foreground-muted)]">
        {description}
      </p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="ui-button ui-button--primary mt-6">
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
