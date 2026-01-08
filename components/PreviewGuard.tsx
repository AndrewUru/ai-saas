"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type PreviewGuardProps = {
  children: ReactNode;
};

export default function PreviewGuard({ children }: PreviewGuardProps) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/widget/preview") ?? false;

  if (hideChrome) return null;
  return <>{children}</>;
}
