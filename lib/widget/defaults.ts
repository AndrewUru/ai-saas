//C:\ai-saas\lib\widget\defaults.ts
export type WidgetPosition = "left" | "right";
export type WidgetLanguage = "auto" | "en" | "es" | "pt" | "fr";
export type WidgetLauncherIcon = "whatsapp" | "chat" | "bot" | "store" | "logo";
export type WidgetFormat = "classic" | "assistant";

export const widgetDefaults = {
  format: "classic" as WidgetFormat,
  accent: "#25d366",
  brand: "AI Widget",
  label: "Chat with us",
  greeting: "How can I help you today?",
  humanSupportText: "Talk to a human",
  launcherIcon: "whatsapp" as WidgetLauncherIcon,
  width: 420,
  height: 640,
  offsetX: 18,
  offsetY: 20,
  launcherSize: 64,
  borderRadius: 24,
  position: "right" as WidgetPosition,
} as const;

export const widgetAccentDefaults = {
  classic: "#25d366",
  assistant: "#111827",
} as const satisfies Record<WidgetFormat, string>;

export const widgetAppearanceDefaults = {
  classic: {
    colorHeaderBg: "#075e54",
    colorHeaderText: "#ffffff",
    colorChatBg: "#efeae2",
    colorUserBubbleBg: "#d9fdd3",
    colorUserBubbleText: "#0b2f20",
    colorBotBubbleBg: "#ffffff",
    colorBotBubbleText: "#0f172a",
    colorToggleBg: "#25d366",
    colorToggleText: "#ffffff",
  },
  assistant: {
    colorHeaderBg: "#ffffff",
    colorHeaderText: "#111827",
    colorChatBg: "#f7f7f4",
    colorUserBubbleBg: "#111827",
    colorUserBubbleText: "#ffffff",
    colorBotBubbleBg: "#ffffff",
    colorBotBubbleText: "#1f2937",
    colorToggleBg: "#111827",
    colorToggleText: "#ffffff",
  },
} as const satisfies Record<
  WidgetFormat,
  {
    colorHeaderBg: string;
    colorHeaderText: string;
    colorChatBg: string;
    colorUserBubbleBg: string;
    colorUserBubbleText: string;
    colorBotBubbleBg: string;
    colorBotBubbleText: string;
    colorToggleBg: string;
    colorToggleText: string;
  }
>;

export const widgetCopyDefaults = {
  en: {
    label: "Chat with us",
    greeting: "How can I help you today?",
    humanSupportText: "Talk to a human",
  },
  es: {
    label: "Chatea con nosotros",
    greeting: "Como puedo ayudarte hoy?",
    humanSupportText: "Habla con una persona",
  },
  pt: {
    label: "Fale conosco",
    greeting: "Como posso ajudar hoje?",
    humanSupportText: "Falar com uma pessoa",
  },
  fr: {
    label: "Discuter avec nous",
    greeting: "Comment puis-je vous aider aujourd'hui ?",
    humanSupportText: "Parler a une personne",
  },
} as const satisfies Record<
  Exclude<WidgetLanguage, "auto">,
  {
    label: string;
    greeting: string;
    humanSupportText: string;
  }
>;

export const widgetLimits = {
  brand: 40,
  label: 48,
  greeting: 48,
  humanSupportText: 32,
  launcherLogoUrl: 512,
  width: { min: 320, max: 720 },
  height: { min: 420, max: 820 },
  offsetX: { min: 0, max: 120 },
  offsetY: { min: 0, max: 120 },
  launcherSize: { min: 48, max: 88 },
  borderRadius: { min: 12, max: 32 },
} as const;

export const widgetPositions: WidgetPosition[] = ["left", "right"];

export const widgetLanguages: WidgetLanguage[] = ["auto", "en", "es", "pt", "fr"];

export const widgetFormats: WidgetFormat[] = ["classic", "assistant"];

export const widgetLauncherIcons: WidgetLauncherIcon[] = [
  "whatsapp",
  "chat",
  "bot",
  "store",
  "logo",
];

export function sanitizeWidgetLanguage(
  language?: string | null
): WidgetLanguage {
  if (language === "en" || language === "es" || language === "pt" || language === "fr") {
    return language;
  }
  return "auto";
}

export function getWidgetCopyDefaults(language?: string | null) {
  const normalized = sanitizeWidgetLanguage(language);
  if (normalized === "auto") return widgetCopyDefaults.en;
  return widgetCopyDefaults[normalized];
}

export function sanitizeWidgetFormat(format?: string | null): WidgetFormat {
  return format === "assistant" ? "assistant" : widgetDefaults.format;
}

export function getWidgetAccentDefault(format?: string | null) {
  return widgetAccentDefaults[sanitizeWidgetFormat(format)];
}

export function getWidgetAppearanceDefaults(format?: string | null) {
  return widgetAppearanceDefaults[sanitizeWidgetFormat(format)];
}

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

export function sanitizeLauncherIcon(
  icon?: string | null
): WidgetLauncherIcon {
  return icon === "chat" ||
    icon === "bot" ||
    icon === "store" ||
    icon === "logo" ||
    icon === "whatsapp"
    ? icon
    : widgetDefaults.launcherIcon;
}

export function sanitizeWidgetNumber(
  value: string | number | null | undefined,
  fallback: number,
  min: number,
  max: number
) {
  const parsed =
    typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.round(parsed)));
}
