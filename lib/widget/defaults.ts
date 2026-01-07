export type WidgetPosition = "left" | "right";

export const widgetDefaults = {
  accent: "#2563eb",
  brand: "AI Widget",
  label: "Chatea con nosotros",
  greeting: "¿En qué puedo ayudarte hoy?",
  humanSupportText: "Hablar con un humano",
  position: "right" as WidgetPosition,
} as const;

export const widgetLimits = {
  brand: 40,
  label: 48,
  greeting: 48,
  humanSupportText: 32,
} as const;

export const widgetPositions: WidgetPosition[] = ["left", "right"];

export function sanitizeHex(color?: string | null) {
  if (!color) return widgetDefaults.accent;
  let input = color.trim();
  if (!input) return widgetDefaults.accent;
  if (!input.startsWith("#")) input = `#${input}`;

  const hexMatch = input.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!hexMatch) return widgetDefaults.accent;

  let hex = hexMatch[1].toLowerCase();
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }
  return `#${hex}`;
}

export function sanitizePosition(pos?: string | null): WidgetPosition {
  return pos === "left" || pos === "right" ? pos : widgetDefaults.position;
}
