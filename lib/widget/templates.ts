import type {
  WidgetFormat,
  WidgetLauncherIcon,
  WidgetLauncherStyle,
  WidgetPosition,
} from "./defaults";
import type { WidgetConfig } from "./types";

export type WidgetTemplateId =
  | "whatsapp"
  | "openai"
  | "online-store"
  | "minimal-assistant";

export type WidgetTemplateCategory = "support" | "ai" | "commerce";

export interface WidgetTemplateSettings {
  format: WidgetFormat;
  accent: string;
  brandName: string;
  collapsedLabel: string;
  greeting: string;
  humanSupportText: string;
  launcherIcon: WidgetLauncherIcon;
  launcherLogoUrl: string;
  launcherStyle: WidgetLauncherStyle;
  bubbleSubtitle: string;
  bubbleUseThree: boolean;
  bubbleWidth: number;
  bubbleRadius: number;
  position: WidgetPosition;
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  launcherSize: number;
  borderRadius: number;
  appearance: WidgetConfig["appearance"];
}

export interface WidgetTemplate {
  id: WidgetTemplateId;
  name: string;
  description: string;
  category: WidgetTemplateCategory;
  settings: WidgetTemplateSettings;
}

export const widgetTemplates = [
  {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Soporte familiar, cercano y reconocible al instante.",
    category: "support",
    settings: {
      format: "classic",
      accent: "#25d366",
      brandName: "Atención al cliente",
      collapsedLabel: "¿Necesitas ayuda?",
      greeting: "¡Hola! ¿En qué podemos ayudarte?",
      humanSupportText: "Solemos responder al instante",
      launcherIcon: "whatsapp",
      launcherLogoUrl: "",
      launcherStyle: "icon",
      bubbleSubtitle: "Escríbenos, estamos para ayudarte.",
      bubbleUseThree: false,
      bubbleWidth: 224,
      bubbleRadius: 22,
      position: "right",
      width: 400,
      height: 620,
      offsetX: 18,
      offsetY: 20,
      launcherSize: 60,
      borderRadius: 20,
      appearance: {
        colorHeaderBg: "#075e54",
        colorHeaderText: "#ffffff",
        colorChatBg: "#efeae2",
        colorUserBubbleBg: "#d9fdd3",
        colorUserBubbleText: "#111b21",
        colorBotBubbleBg: "#ffffff",
        colorBotBubbleText: "#111b21",
        colorToggleBg: "#25d366",
        colorToggleText: "#ffffff",
        colorBubbleBg: "#075e54",
        colorBubbleText: "#ffffff",
        colorBubbleSubtext: "#d9fdd3",
        colorBubbleBorder: "#128c7e",
        colorBubbleGlow: "#25d366",
      },
    },
  },
  {
    id: "openai",
    name: "OpenAI",
    description: "Lienzo claro y sobrio inspirado en asistentes de IA.",
    category: "ai",
    settings: {
      format: "assistant",
      accent: "#10a37f",
      brandName: "AI Assistant",
      collapsedLabel: "Ask AI",
      greeting: "How can I help you today?",
      humanSupportText: "AI assistant",
      launcherIcon: "sparkles",
      launcherLogoUrl: "",
      launcherStyle: "card",
      bubbleSubtitle: "Answers, ideas and guidance in seconds.",
      bubbleUseThree: true,
      bubbleWidth: 248,
      bubbleRadius: 24,
      position: "right",
      width: 440,
      height: 680,
      offsetX: 20,
      offsetY: 20,
      launcherSize: 62,
      borderRadius: 24,
      appearance: {
        colorHeaderBg: "#ffffff",
        colorHeaderText: "#202123",
        colorChatBg: "#f7f7f8",
        colorUserBubbleBg: "#10a37f",
        colorUserBubbleText: "#ffffff",
        colorBotBubbleBg: "#ffffff",
        colorBotBubbleText: "#202123",
        colorToggleBg: "#10a37f",
        colorToggleText: "#ffffff",
        colorBubbleBg: "#202123",
        colorBubbleText: "#ffffff",
        colorBubbleSubtext: "#d1d5db",
        colorBubbleBorder: "#353740",
        colorBubbleGlow: "#10a37f",
      },
    },
  },
  {
    id: "online-store",
    name: "Tienda online",
    description: "Pensada para recomendaciones, productos y pedidos.",
    category: "commerce",
    settings: {
      format: "classic",
      accent: "#7c3aed",
      brandName: "Asistente de compras",
      collapsedLabel: "¿Te ayudamos a elegir?",
      greeting: "¡Hola! ¿Qué producto estás buscando?",
      humanSupportText: "Productos, pedidos y cambios",
      launcherIcon: "store",
      launcherLogoUrl: "",
      launcherStyle: "card",
      bubbleSubtitle: "Encuentra el producto ideal para ti.",
      bubbleUseThree: true,
      bubbleWidth: 256,
      bubbleRadius: 20,
      position: "right",
      width: 420,
      height: 660,
      offsetX: 20,
      offsetY: 20,
      launcherSize: 64,
      borderRadius: 22,
      appearance: {
        colorHeaderBg: "#4c1d95",
        colorHeaderText: "#ffffff",
        colorChatBg: "#faf5ff",
        colorUserBubbleBg: "#7c3aed",
        colorUserBubbleText: "#ffffff",
        colorBotBubbleBg: "#ffffff",
        colorBotBubbleText: "#2e1065",
        colorToggleBg: "#7c3aed",
        colorToggleText: "#ffffff",
        colorBubbleBg: "#2e1065",
        colorBubbleText: "#ffffff",
        colorBubbleSubtext: "#ddd6fe",
        colorBubbleBorder: "#6d28d9",
        colorBubbleGlow: "#a78bfa",
      },
    },
  },
  {
    id: "minimal-assistant",
    name: "Asistente minimalista",
    description: "Monocromo, compacto y discreto para cualquier marca.",
    category: "ai",
    settings: {
      format: "assistant",
      accent: "#18181b",
      brandName: "Assistant",
      collapsedLabel: "How can I help?",
      greeting: "What can I help you with?",
      humanSupportText: "Online now",
      launcherIcon: "bot",
      launcherLogoUrl: "",
      launcherStyle: "icon",
      bubbleSubtitle: "Simple answers, right when you need them.",
      bubbleUseThree: false,
      bubbleWidth: 216,
      bubbleRadius: 18,
      position: "right",
      width: 380,
      height: 600,
      offsetX: 16,
      offsetY: 16,
      launcherSize: 56,
      borderRadius: 18,
      appearance: {
        colorHeaderBg: "#ffffff",
        colorHeaderText: "#18181b",
        colorChatBg: "#fafafa",
        colorUserBubbleBg: "#18181b",
        colorUserBubbleText: "#ffffff",
        colorBotBubbleBg: "#f4f4f5",
        colorBotBubbleText: "#27272a",
        colorToggleBg: "#18181b",
        colorToggleText: "#ffffff",
        colorBubbleBg: "#18181b",
        colorBubbleText: "#ffffff",
        colorBubbleSubtext: "#a1a1aa",
        colorBubbleBorder: "#3f3f46",
        colorBubbleGlow: "#71717a",
      },
    },
  },
] as const satisfies readonly WidgetTemplate[];

const widgetTemplateMap = new Map(
  widgetTemplates.map((template) => [template.id, template]),
);

export function isWidgetTemplateId(value: string): value is WidgetTemplateId {
  return widgetTemplateMap.has(value as WidgetTemplateId);
}

export function getWidgetTemplate(
  templateId: WidgetTemplateId,
): WidgetTemplate {
  return widgetTemplateMap.get(templateId) ?? widgetTemplates[0];
}

export function applyWidgetTemplate(
  current: Partial<WidgetTemplateSettings>,
  templateId: WidgetTemplateId,
): WidgetTemplateSettings {
  const template = getWidgetTemplate(templateId).settings;

  return {
    ...current,
    ...template,
    appearance: {
      ...current.appearance,
      ...template.appearance,
    },
  };
}
