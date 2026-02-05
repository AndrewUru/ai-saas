// C:\ai-saas\app\widget\preview\page.tsx
"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export const dynamic = "force-dynamic";

export default function WidgetPreviewPage() {
  const sp = useSearchParams();

  const src = useMemo(() => {
    const params = new URLSearchParams(sp.toString());
    params.set("preview", "1");
    return `/api/widget?${params.toString()}`;
  }, [sp]);

  return <Script src={src} strategy="afterInteractive" />;
}
