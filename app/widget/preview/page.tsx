// C:\ai-saas\app\widget\preview\page.tsx
import Script from "next/script";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export const dynamic = "force-dynamic";

export default async function WidgetPreviewPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const params = new URLSearchParams();

  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => params.append(key, entry));
      return;
    }
    if (typeof value === "string") params.set(key, value);
  });

  // Asegura modo preview
  params.set("preview", "1");

  // Script del widget (mismo host)
  const src = `/api/widget?${params.toString()}`;

  return (
    <>
      {/* Fondo mínimo (opcional). Quita este div si lo quieres totalmente transparente */}
      <div
        style={{
          position: "fixed",
          inset: 0,
        }}
      />

      {/* Carga del widget */}
      <Script src={src} strategy="afterInteractive" />
    </>
  );
}
