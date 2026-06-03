//C:\ai-saas\lib\widget\defaults.ts
export type WidgetPosition = "left" | "right";
export type WidgetLanguage = "auto" | "en" | "es" | "pt" | "fr";
export type WidgetLauncherIcon = "whatsapp" | "chat" | "bot" | "store" | "logo";

export const widgetDefaults = {
  accent: "#25d366",
  brand: "AI Widget",
  label: "Chat with us",
  greeting: "How can I help you today?",
  humanSupportText: "Talk to a human",
  launcherIcon: "whatsapp" as WidgetLauncherIcon,

  position: "right" as WidgetPosition,
} as const;

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
} as const;

export const widgetPositions: WidgetPosition[] = ["left", "right"];

export const widgetLanguages: WidgetLanguage[] = ["auto", "en", "es", "pt", "fr"];

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
