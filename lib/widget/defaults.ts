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

export type AvatarType = "initial" | "bubble" | "image";
export type BubbleStyle = "default" | "energy" | "calm";

export const avatarDefaults = {
  type: "initial" as AvatarType,
  style: "default" as BubbleStyle,
  bubbleColors: ["#5eead4", "#818cf8", "#f472b6"], // example defaults
};

export const AVATAR_TYPES: AvatarType[] = ["initial", "bubble", "image"];
export const BUBBLE_STYLES: BubbleStyle[] = ["default", "energy", "calm"];

export function sanitizeAvatarType(val?: string | null): AvatarType {
  if (!val) return avatarDefaults.type;
  return AVATAR_TYPES.includes(val as AvatarType)
    ? (val as AvatarType)
    : avatarDefaults.type;
}

export function sanitizeBubbleStyle(val?: string | null): BubbleStyle {
  if (!val) return avatarDefaults.style;
  return BUBBLE_STYLES.includes(val as BubbleStyle)
    ? (val as BubbleStyle)
    : avatarDefaults.style;
}
