// C:\ai-saas\app\widget\preview\page.tsx
import { Suspense } from "react";
import WidgetPreviewClient from "./widget-preview-client";

export const dynamic = "force-dynamic";

export default function WidgetPreviewPage() {
  return (
    <Suspense fallback={null}>
      <WidgetPreviewClient />
    </Suspense>
  );
}
