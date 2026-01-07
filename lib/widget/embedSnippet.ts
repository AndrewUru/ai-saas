const ORIGIN = "https://agentes.elsaltoweb.es";

export function getWidgetScriptSrc(apiKey: string): string {
  return `${ORIGIN}/api/widget?key=${encodeURIComponent(apiKey)}`;
}

export function getEmbedSnippet(apiKey: string): string {
  const src = getWidgetScriptSrc(apiKey);
  return `<script async src="${src}"></script>`;
}
