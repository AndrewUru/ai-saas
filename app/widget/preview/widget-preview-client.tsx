// C:\ai-saas\app\widget\preview\widget-preview-client.tsx
"use client";

import Script from "next/script";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function WidgetPreviewClient() {
  const sp = useSearchParams();

  const src = useMemo(() => {
    const params = new URLSearchParams(sp.toString());
    params.set("preview", "1");
    return `/api/widget?${params.toString()}`;
  }, [sp]);

  return <Script src={src} strategy="afterInteractive" />;
}
