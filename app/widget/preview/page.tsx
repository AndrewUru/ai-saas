type WidgetPreviewPageProps = {
  searchParams: Record<string, string | string[] | undefined>;
};

export default function WidgetPreviewPage({
  searchParams,
}: WidgetPreviewPageProps) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((entry) => {
        params.append(key, entry);
      });
      return;
    }
    if (typeof value === "string") {
      params.set(key, value);
    }
  });

  params.set("preview", "1");
  const src = `/api/widget?${params.toString()}`;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#020617",
        color: "#e2e8f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "\"Inter\", \"Helvetica Neue\", Arial, sans-serif",
      }}
    >
      <script async src={src}></script>
    </div>
  );
}
