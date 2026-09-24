"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bot,
  Check,
  Clipboard,
  Frame,
  Image as ImageIcon,
  Maximize2,
  type LucideIcon,
  MessageSquare,
  Monitor,
  MousePointer2,
  Move,
  Palette,
  RotateCcw,
  Smartphone,
  Sparkles,
  Store,
  WandSparkles,
  Type,
} from "lucide-react";
import {
  getWidgetAccentDefault,
  getWidgetAppearanceDefaults,
  type WidgetFormat,
  type WidgetLauncherIcon,
  type WidgetLauncherStyle,
  widgetDefaults,
  widgetFormats,
  widgetLauncherIcons,
  widgetLauncherStyles,
  widgetLimits,
  widgetPositions,
  WidgetPosition,
} from "@/lib/widget/defaults";
import { getEmbedSnippet } from "@/lib/widget/embedSnippet";
import {
  type WidgetTemplateId,
  widgetTemplates,
} from "@/lib/widget/templates";

function useDebouncedValue<T>(value: T, delay = 300) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timeoutId = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timeoutId);
  }, [value, delay]);

  return debounced;
}

type WidgetDesignerProps = {
  apiKey: string;
  siteUrl: string;
  initialAccent: string | null;
  initialBrand: string | null;
  initialLabel: string | null;
  initialGreeting: string | null;
  initialLanguage: string | null;

  initialHumanSupportText: string | null;
  initialFormat: WidgetFormat | string | null;
  initialPosition: WidgetPosition | null;
  initialWidth: number | null;
  initialHeight: number | null;
  initialOffsetX: number | null;
  initialOffsetY: number | null;
  initialLauncherSize: number | null;
  initialBorderRadius: number | null;
  initialLauncherStyle: WidgetLauncherStyle | string | null;
  initialBubbleSubtitle: string | null;
  initialBubbleUseThree: boolean | null;
  initialBubbleWidth: number | null;
  initialBubbleRadius: number | null;

  initialColorHeaderBg: string | null;
  initialColorHeaderText: string | null;
  initialColorChatBg: string | null;
  initialColorUserBubbleBg: string | null;
  initialColorUserBubbleText: string | null;
  initialColorBotBubbleBg: string | null;
  initialColorBotBubbleText: string | null;
  initialColorToggleBg: string | null;
  initialColorToggleText: string | null;
  initialColorBubbleBg: string | null;
  initialColorBubbleText: string | null;
  initialColorBubbleSubtext: string | null;
  initialColorBubbleBorder: string | null;
  initialColorBubbleGlow: string | null;
  initialLauncherIcon: WidgetLauncherIcon | string | null;
  initialLauncherLogoUrl: string | null;
};

type EditablePart =
  | "presets"
  | "header"
  | "chat"
  | "botBubble"
  | "userBubble"
  | "composer"
  | "launcher"
  | "layout";

type PreviewViewport = "desktop" | "mobile";

const editableParts: Array<{
  id: EditablePart;
  label: string;
  description: string;
  icon: LucideIcon;
}> = [
  {
    id: "presets",
    label: "Styles",
    description: "Apply a complete visual direction.",
    icon: WandSparkles,
  },
  {
    id: "header",
    label: "Header",
    description: "Edit the identity shown at the top.",
    icon: Type,
  },
  {
    id: "chat",
    label: "Canvas",
    description: "Set the chat background and main accent.",
    icon: Palette,
  },
  {
    id: "botBubble",
    label: "Assistant",
    description: "Style assistant messages.",
    icon: Bot,
  },
  {
    id: "userBubble",
    label: "Customer",
    description: "Style customer messages.",
    icon: MessageSquare,
  },
  {
    id: "composer",
    label: "Welcome",
    description: "Change the first message customers see.",
    icon: Sparkles,
  },
  {
    id: "launcher",
    label: "Launcher",
    description: "Customize the button that opens the chat.",
    icon: ImageIcon,
  },
  {
    id: "layout",
    label: "Size & position",
    description: "Control placement, dimensions, and corners.",
    icon: Maximize2,
  },
];

const editablePartMap = new Map(editableParts.map((part) => [part.id, part]));

function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;

  let hex = trimmed.startsWith("#") ? trimmed.slice(1) : trimmed;
  if (/^[0-9a-f]{3}$/i.test(hex)) {
    hex = hex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  if (!/^[0-9a-f]{6}$/i.test(hex)) return null;
  return `#${hex.toLowerCase()}`;
}

function toParamHex(value: string): string | null {
  const normalized = normalizeHex(value);
  if (!normalized) return null;
  return normalized.slice(1);
}

function trimmedOrNull(value: string, max: number): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  return trimmed.slice(0, max);
}

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-800 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/30";

const launcherIconLabels: Record<WidgetLauncherIcon, string> = {
  whatsapp: "WhatsApp",
  chat: "Chat",
  sparkles: "AI sparkles",
  bot: "Bot",
  store: "Store",
  logo: "Logo URL",
};

const launcherStyleLabels: Record<WidgetLauncherStyle, string> = {
  icon: "Compact icon",
  card: "AI bubble card",
};

const launcherStyleHelp: Record<WidgetLauncherStyle, string> = {
  icon: "Round launcher with hover label.",
  card: "Assistant card with title, subtitle, glow, and 3D orb.",
};

function normalizeWidgetFormat(value: string | null): WidgetFormat {
  return widgetFormats.includes(value as WidgetFormat)
    ? (value as WidgetFormat)
    : widgetDefaults.format;
}

function normalizeLauncherIcon(value: string | null): WidgetLauncherIcon {
  return widgetLauncherIcons.includes(value as WidgetLauncherIcon)
    ? (value as WidgetLauncherIcon)
    : widgetDefaults.launcherIcon;
}

function normalizeLauncherStyle(value: string | null): WidgetLauncherStyle {
  return widgetLauncherStyles.includes(value as WidgetLauncherStyle)
    ? (value as WidgetLauncherStyle)
    : widgetDefaults.launcherStyle;
}

function getAssistantCardIcon(icon: WidgetLauncherIcon): WidgetLauncherIcon {
  return icon === "chat" || icon === "whatsapp" || icon === "bot"
    ? "sparkles"
    : icon;
}

function FieldInput({
  label,
  name,
  value,
  onChange,
  maxLength,
  placeholder,
  helper,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  maxLength: number;
  placeholder: string;
  helper: string;
}) {
  const remaining = maxLength - value.length;

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-end justify-between gap-3">
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          {label}
        </label>
        <span className="text-[11px] text-slate-500">{remaining} left</span>
      </div>
      <input
        id={name}
        name={name}
        maxLength={maxLength}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className={inputClass}
      />
      <p className="text-xs leading-relaxed text-slate-500">{helper}</p>
    </div>
  );
}

function ColorInput({
  label,
  name,
  value,
  onChange,
  defaultValue,
  errorMessage = "Use a valid hex value.",
}: {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  defaultValue: string;
  errorMessage?: string;
}) {
  const pickerValue = normalizeHex(value) ?? defaultValue;
  const hasCustomValue = Boolean(value.trim());
  const isInvalid = hasCustomValue && !normalizeHex(value);

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
        >
          {label}
        </label>
        {hasCustomValue && (
          <button
            type="button"
            onClick={() => onChange("")}
            className="text-[11px] font-semibold text-slate-500 transition hover:text-neutral-200"
          >
            Reset
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <input
          type="color"
          aria-label={`${label} color picker`}
          className="h-10 w-10 shrink-0 cursor-pointer rounded-xl border border-slate-700  p-1"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
        />

        <input
          id={name}
          name={name}
          placeholder={defaultValue}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`min-w-0 flex-1 rounded-xl border px-3 py-2.5 text-sm text-white placeholder:text-slate-500 outline-none transition focus:ring-2 ${
            isInvalid
              ? "border-rose-400/60 focus:border-rose-300 focus:ring-rose-400/25"
              : "border-slate-800 focus:border-neutral-400 focus:ring-neutral-400/30"
          }`}
        />
      </div>
      {isInvalid && (
        <p className="text-xs text-rose-300">{errorMessage}</p>
      )}
    </div>
  );
}

function RangeInput({
  label,
  name,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix = "px",
}: {
  label: string;
  name: string;
  value: number;
  onChange: (val: number) => void;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
}) {
  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-center justify-between gap-3">
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
        >
          {label}
        </label>
        <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[11px] font-semibold text-neutral-100">
          {value}
          {suffix}
        </span>
      </div>
      <input
        id={name}
        name={name}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="w-full accent-neutral-400"
      />
    </div>
  );
}

export default function WidgetDesigner({
  apiKey,
  siteUrl,
  initialAccent,
  initialBrand,
  initialLabel,
  initialGreeting,
  initialLanguage,
  initialHumanSupportText,
  initialFormat,
  initialPosition,
  initialWidth,
  initialHeight,
  initialOffsetX,
  initialOffsetY,
  initialLauncherSize,
  initialBorderRadius,
  initialLauncherStyle,
  initialBubbleSubtitle,
  initialBubbleUseThree,
  initialBubbleWidth,
  initialBubbleRadius,
  initialColorHeaderBg,
  initialColorHeaderText,
  initialColorChatBg,
  initialColorUserBubbleBg,
  initialColorUserBubbleText,
  initialColorBotBubbleBg,
  initialColorBotBubbleText,
  initialColorToggleBg,
  initialColorToggleText,
  initialColorBubbleBg,
  initialColorBubbleText,
  initialColorBubbleSubtext,
  initialColorBubbleBorder,
  initialColorBubbleGlow,
  initialLauncherIcon,
  initialLauncherLogoUrl,
}: WidgetDesignerProps) {
  const initialNormalizedLauncherStyle = normalizeLauncherStyle(
    initialLauncherStyle,
  );
  const initialNormalizedLauncherIcon = normalizeLauncherIcon(
    initialLauncherIcon,
  );

  const [accentInput, setAccentInput] = useState(initialAccent ?? "");
  const [brandInput, setBrandInput] = useState(initialBrand ?? "");
  const [labelInput, setLabelInput] = useState(initialLabel ?? "");
  const [greetingInput, setGreetingInput] = useState(initialGreeting ?? "");
  const [humanSupportTextInput, setHumanSupportTextInput] = useState(
    initialHumanSupportText ?? "",
  );
  const [bubbleSubtitleInput, setBubbleSubtitleInput] = useState(
    initialBubbleSubtitle ?? "",
  );
  const [format, setFormat] = useState<WidgetFormat>(
    normalizeWidgetFormat(initialFormat),
  );
  const [launcherStyle, setLauncherStyle] = useState<WidgetLauncherStyle>(
    initialNormalizedLauncherStyle,
  );
  const [bubbleUseThree, setBubbleUseThree] = useState(
    initialBubbleUseThree ?? widgetDefaults.bubbleUseThree,
  );
  const [position, setPosition] = useState<WidgetPosition>(
    initialPosition ?? widgetDefaults.position,
  );
  const [width, setWidth] = useState(initialWidth ?? widgetDefaults.width);
  const [height, setHeight] = useState(initialHeight ?? widgetDefaults.height);
  const [offsetX, setOffsetX] = useState(
    initialOffsetX ?? widgetDefaults.offsetX,
  );
  const [offsetY, setOffsetY] = useState(
    initialOffsetY ?? widgetDefaults.offsetY,
  );
  const [launcherSize, setLauncherSize] = useState(
    initialLauncherSize ?? widgetDefaults.launcherSize,
  );
  const [borderRadius, setBorderRadius] = useState(
    initialBorderRadius ?? widgetDefaults.borderRadius,
  );
  const [bubbleWidth, setBubbleWidth] = useState(
    initialBubbleWidth ?? widgetDefaults.bubbleWidth,
  );
  const [bubbleRadius, setBubbleRadius] = useState(
    initialBubbleRadius ?? widgetDefaults.bubbleRadius,
  );

  const [colorHeaderBg, setColorHeaderBg] = useState(
    initialColorHeaderBg ?? "",
  );
  const [colorHeaderText, setColorHeaderText] = useState(
    initialColorHeaderText ?? "",
  );
  const [colorChatBg, setColorChatBg] = useState(initialColorChatBg ?? "");
  const [colorUserBubbleBg, setColorUserBubbleBg] = useState(
    initialColorUserBubbleBg ?? "",
  );
  const [colorUserBubbleText, setColorUserBubbleText] = useState(
    initialColorUserBubbleText ?? "",
  );
  const [colorBotBubbleBg, setColorBotBubbleBg] = useState(
    initialColorBotBubbleBg ?? "",
  );
  const [colorBotBubbleText, setColorBotBubbleText] = useState(
    initialColorBotBubbleText ?? "",
  );
  const [colorToggleBg, setColorToggleBg] = useState(
    initialColorToggleBg ?? "",
  );
  const [colorToggleText, setColorToggleText] = useState(
    initialColorToggleText ?? "",
  );
  const [colorBubbleBg, setColorBubbleBg] = useState(
    initialColorBubbleBg ?? "",
  );
  const [colorBubbleText, setColorBubbleText] = useState(
    initialColorBubbleText ?? "",
  );
  const [colorBubbleSubtext, setColorBubbleSubtext] = useState(
    initialColorBubbleSubtext ?? "",
  );
  const [colorBubbleBorder, setColorBubbleBorder] = useState(
    initialColorBubbleBorder ?? "",
  );
  const [colorBubbleGlow, setColorBubbleGlow] = useState(
    initialColorBubbleGlow ?? "",
  );
  const [launcherIcon, setLauncherIcon] = useState<WidgetLauncherIcon>(
    initialNormalizedLauncherStyle === "card"
      ? getAssistantCardIcon(initialNormalizedLauncherIcon)
      : initialNormalizedLauncherIcon,
  );
  const [launcherLogoUrl, setLauncherLogoUrl] = useState(
    initialLauncherLogoUrl ?? "",
  );
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");
  const [selectedTemplateId, setSelectedTemplateId] =
    useState<WidgetTemplateId | null>(null);
  const [selectedPart, setSelectedPart] = useState<EditablePart>("launcher");
  const [previewViewport, setPreviewViewport] =
    useState<PreviewViewport>("desktop");
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;
      if (event.data?.type === "ai-widget-editor:ready") {
        iframeRef.current?.contentWindow?.postMessage(
          { type: "ai-widget-editor:select", part: selectedPart },
          window.location.origin,
        );
        return;
      }
      if (event.data?.type !== "ai-widget-editor:select") return;
      if (!editablePartMap.has(event.data.part as EditablePart)) return;
      setSelectedPart(event.data.part as EditablePart);
    };

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [selectedPart]);

  const embedSnippet = getEmbedSnippet(apiKey);
  const accentDefault = getWidgetAccentDefault(format);
  const appearanceDefaults = getWidgetAppearanceDefaults(format);

  const handleLauncherStyleChange = (nextStyle: WidgetLauncherStyle) => {
    setLauncherStyle(nextStyle);
    if (nextStyle === "card") {
      setLauncherIcon((currentIcon) => getAssistantCardIcon(currentIcon));
    }
  };

  const handleTemplateSelect = (templateId: WidgetTemplateId) => {
    const template = widgetTemplates.find((item) => item.id === templateId);
    if (!template) return;

    const settings = template.settings;
    setSelectedTemplateId(templateId);
    setFormat(settings.format);
    setAccentInput(settings.accent);
    setBrandInput(settings.brandName);
    setLabelInput(settings.collapsedLabel);
    setGreetingInput(settings.greeting);
    setHumanSupportTextInput(settings.humanSupportText);
    setLauncherIcon(settings.launcherIcon);
    setLauncherLogoUrl(settings.launcherLogoUrl);
    setLauncherStyle(settings.launcherStyle);
    setBubbleSubtitleInput(settings.bubbleSubtitle);
    setBubbleUseThree(settings.bubbleUseThree);
    setBubbleWidth(settings.bubbleWidth);
    setBubbleRadius(settings.bubbleRadius);
    setPosition(settings.position);
    setWidth(settings.width);
    setHeight(settings.height);
    setOffsetX(settings.offsetX);
    setOffsetY(settings.offsetY);
    setLauncherSize(settings.launcherSize);
    setBorderRadius(settings.borderRadius);
    setColorHeaderBg(settings.appearance.colorHeaderBg);
    setColorHeaderText(settings.appearance.colorHeaderText);
    setColorChatBg(settings.appearance.colorChatBg);
    setColorUserBubbleBg(settings.appearance.colorUserBubbleBg);
    setColorUserBubbleText(settings.appearance.colorUserBubbleText);
    setColorBotBubbleBg(settings.appearance.colorBotBubbleBg);
    setColorBotBubbleText(settings.appearance.colorBotBubbleText);
    setColorToggleBg(settings.appearance.colorToggleBg);
    setColorToggleText(settings.appearance.colorToggleText);
    setColorBubbleBg(settings.appearance.colorBubbleBg);
    setColorBubbleText(settings.appearance.colorBubbleText);
    setColorBubbleSubtext(settings.appearance.colorBubbleSubtext);
    setColorBubbleBorder(settings.appearance.colorBubbleBorder);
    setColorBubbleGlow(settings.appearance.colorBubbleGlow);
  };

  const liveStateInput = useMemo(
    () => ({
      apiKey,
      siteUrl,
      accentInput,
      brandInput,
      labelInput,
      greetingInput,
      initialLanguage,
      humanSupportTextInput,
      bubbleSubtitleInput,
      format,
      launcherStyle,
      bubbleUseThree,
      position,
      width,
      height,
      offsetX,
      offsetY,
      launcherSize,
      borderRadius,
      bubbleWidth,
      bubbleRadius,
      colorHeaderBg,
      colorHeaderText,
      colorChatBg,
      colorUserBubbleBg,
      colorUserBubbleText,
      colorBotBubbleBg,
      colorBotBubbleText,
      colorToggleBg,
      colorToggleText,
      colorBubbleBg,
      colorBubbleText,
      colorBubbleSubtext,
      colorBubbleBorder,
      colorBubbleGlow,
      launcherIcon,
      launcherLogoUrl,
    }),
    [
      apiKey,
      siteUrl,
      accentInput,
      brandInput,
      labelInput,
      greetingInput,
      initialLanguage,
      humanSupportTextInput,
      bubbleSubtitleInput,
      format,
      launcherStyle,
      bubbleUseThree,
      position,
      width,
      height,
      offsetX,
      offsetY,
      launcherSize,
      borderRadius,
      bubbleWidth,
      bubbleRadius,
      colorHeaderBg,
      colorHeaderText,
      colorChatBg,
      colorUserBubbleBg,
      colorUserBubbleText,
      colorBotBubbleBg,
      colorBotBubbleText,
      colorToggleBg,
      colorToggleText,
      colorBubbleBg,
      colorBubbleText,
      colorBubbleSubtext,
      colorBubbleBorder,
      colorBubbleGlow,
      launcherIcon,
      launcherLogoUrl,
    ],
  );

  const liveState = useDebouncedValue(liveStateInput, 300);

  const previewPageUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("key", liveState.apiKey);
    params.set("preview", "1");
    params.set("accent", toParamHex(liveState.accentInput) ?? "");
    params.set(
      "brandName",
      trimmedOrNull(liveState.brandInput, widgetLimits.brand) ?? "",
    );
    params.set(
      "collapsedLabel",
      trimmedOrNull(liveState.labelInput, widgetLimits.label) ?? "",
    );
    params.set(
      "greeting",
      trimmedOrNull(liveState.greetingInput, widgetLimits.greeting) ?? "",
    );
    params.set("language", liveState.initialLanguage ?? "auto");
    params.set(
      "humanSupportText",
      trimmedOrNull(
        liveState.humanSupportTextInput,
        widgetLimits.humanSupportText,
      ) ?? "",
    );
    params.set(
      "bubbleSubtitle",
      trimmedOrNull(
        liveState.bubbleSubtitleInput,
        widgetLimits.bubbleSubtitle,
      ) ?? "",
    );
    params.set("format", liveState.format);
    params.set("launcherStyle", liveState.launcherStyle);
    params.set("bubbleUseThree", liveState.bubbleUseThree ? "1" : "0");
    params.set("position", liveState.position);
    params.set("width", String(liveState.width));
    params.set("height", String(liveState.height));
    params.set("offsetX", String(liveState.offsetX));
    params.set("offsetY", String(liveState.offsetY));
    params.set("launcherSize", String(liveState.launcherSize));
    params.set("borderRadius", String(liveState.borderRadius));
    params.set("bubbleWidth", String(liveState.bubbleWidth));
    params.set("bubbleRadius", String(liveState.bubbleRadius));

    params.set("colorHeaderBg", toParamHex(liveState.colorHeaderBg) ?? "");
    params.set("colorHeaderText", toParamHex(liveState.colorHeaderText) ?? "");
    params.set("colorChatBg", toParamHex(liveState.colorChatBg) ?? "");
    params.set(
      "colorUserBubbleBg",
      toParamHex(liveState.colorUserBubbleBg) ?? "",
    );
    params.set(
      "colorUserBubbleText",
      toParamHex(liveState.colorUserBubbleText) ?? "",
    );
    params.set(
      "colorBotBubbleBg",
      toParamHex(liveState.colorBotBubbleBg) ?? "",
    );
    params.set(
      "colorBotBubbleText",
      toParamHex(liveState.colorBotBubbleText) ?? "",
    );
    params.set("colorToggleBg", toParamHex(liveState.colorToggleBg) ?? "");
    params.set("colorToggleText", toParamHex(liveState.colorToggleText) ?? "");
    params.set("colorBubbleBg", toParamHex(liveState.colorBubbleBg) ?? "");
    params.set("colorBubbleText", toParamHex(liveState.colorBubbleText) ?? "");
    params.set(
      "colorBubbleSubtext",
      toParamHex(liveState.colorBubbleSubtext) ?? "",
    );
    params.set(
      "colorBubbleBorder",
      toParamHex(liveState.colorBubbleBorder) ?? "",
    );
    params.set("colorBubbleGlow", toParamHex(liveState.colorBubbleGlow) ?? "");
    params.set("launcherIcon", liveState.launcherIcon);
    params.set(
      "launcherLogoUrl",
      liveState.launcherLogoUrl.trim().slice(0, widgetLimits.launcherLogoUrl),
    );

    return `/widget/preview?${params.toString()}`;
  }, [liveState]);

  const iframeKey = useMemo(() => {
    return [
      liveState.colorHeaderBg,
      liveState.colorHeaderText,
      liveState.colorChatBg,
      liveState.colorUserBubbleBg,
      liveState.colorUserBubbleText,
      liveState.colorBotBubbleBg,
      liveState.colorBotBubbleText,
      liveState.colorToggleBg,
      liveState.colorToggleText,
      liveState.launcherIcon,
      liveState.launcherLogoUrl,
      liveState.accentInput,
      liveState.brandInput,
      liveState.labelInput,
      liveState.greetingInput,
      liveState.initialLanguage,
      liveState.humanSupportTextInput,
      liveState.bubbleSubtitleInput,
      liveState.format,
      liveState.launcherStyle,
      liveState.bubbleUseThree,
      liveState.position,
      liveState.width,
      liveState.height,
      liveState.offsetX,
      liveState.offsetY,
      liveState.launcherSize,
      liveState.borderRadius,
      liveState.bubbleWidth,
      liveState.bubbleRadius,
      liveState.colorBubbleBg,
      liveState.colorBubbleText,
      liveState.colorBubbleSubtext,
      liveState.colorBubbleBorder,
      liveState.colorBubbleGlow,
    ].join("|");
  }, [liveState]);

  function handleReset() {
    setSelectedTemplateId(null);
    setAccentInput("");
    setBrandInput("");
    setLabelInput("");
    setGreetingInput("");
    setHumanSupportTextInput("");
    setBubbleSubtitleInput("");
    setFormat(widgetDefaults.format);
    setLauncherStyle(widgetDefaults.launcherStyle);
    setBubbleUseThree(widgetDefaults.bubbleUseThree);
    setPosition(widgetDefaults.position);
    setWidth(widgetDefaults.width);
    setHeight(widgetDefaults.height);
    setOffsetX(widgetDefaults.offsetX);
    setOffsetY(widgetDefaults.offsetY);
    setLauncherSize(widgetDefaults.launcherSize);
    setBorderRadius(widgetDefaults.borderRadius);
    setBubbleWidth(widgetDefaults.bubbleWidth);
    setBubbleRadius(widgetDefaults.bubbleRadius);
    setColorHeaderBg("");
    setColorHeaderText("");
    setColorChatBg("");
    setColorUserBubbleBg("");
    setColorUserBubbleText("");
    setColorBotBubbleBg("");
    setColorBotBubbleText("");
    setColorToggleBg("");
    setColorToggleText("");
    setColorBubbleBg("");
    setColorBubbleText("");
    setColorBubbleSubtext("");
    setColorBubbleBorder("");
    setColorBubbleGlow("");
    setLauncherIcon(widgetDefaults.launcherIcon);
    setLauncherLogoUrl("");
  }

  function handleCopySnippet() {
    navigator.clipboard.writeText(embedSnippet);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  function selectEditorPart(part: EditablePart) {
    setSelectedPart(part);
    iframeRef.current?.contentWindow?.postMessage(
      { type: "ai-widget-editor:select", part },
      window.location.origin,
    );
  }

  const activePart = editablePartMap.get(selectedPart) ?? editableParts[0];

  return (
    <div className="mt-6 min-w-0 space-y-4">
      <input type="hidden" name="widget_format" value={format} />
      <input type="hidden" name="widget_accent" value={accentInput} />
      <input type="hidden" name="widget_brand" value={brandInput} />
      <input type="hidden" name="widget_label" value={labelInput} />
      <input type="hidden" name="widget_greeting" value={greetingInput} />
      <input type="hidden" name="widget_human_support_text" value={humanSupportTextInput} />
      <input type="hidden" name="widget_launcher_style" value={launcherStyle} />
      <input type="hidden" name="widget_bubble_subtitle" value={bubbleSubtitleInput} />
      <input type="hidden" name="widget_bubble_use_three" value={bubbleUseThree ? "1" : "0"} />
      <input type="hidden" name="widget_bubble_width" value={bubbleWidth} />
      <input type="hidden" name="widget_bubble_radius" value={bubbleRadius} />
      <input type="hidden" name="widget_position" value={position} />
      <input type="hidden" name="widget_width" value={width} />
      <input type="hidden" name="widget_height" value={height} />
      <input type="hidden" name="widget_offset_x" value={offsetX} />
      <input type="hidden" name="widget_offset_y" value={offsetY} />
      <input type="hidden" name="widget_launcher_size" value={launcherSize} />
      <input type="hidden" name="widget_border_radius" value={borderRadius} />
      <input type="hidden" name="widget_color_header_bg" value={colorHeaderBg} />
      <input type="hidden" name="widget_color_header_text" value={colorHeaderText} />
      <input type="hidden" name="widget_color_chat_bg" value={colorChatBg} />
      <input type="hidden" name="widget_color_user_bubble_bg" value={colorUserBubbleBg} />
      <input type="hidden" name="widget_color_user_bubble_text" value={colorUserBubbleText} />
      <input type="hidden" name="widget_color_bot_bubble_bg" value={colorBotBubbleBg} />
      <input type="hidden" name="widget_color_bot_bubble_text" value={colorBotBubbleText} />
      <input type="hidden" name="widget_color_toggle_bg" value={colorToggleBg} />
      <input type="hidden" name="widget_color_toggle_text" value={colorToggleText} />
      <input type="hidden" name="widget_color_bubble_bg" value={colorBubbleBg} />
      <input type="hidden" name="widget_color_bubble_text" value={colorBubbleText} />
      <input type="hidden" name="widget_color_bubble_subtext" value={colorBubbleSubtext} />
      <input type="hidden" name="widget_color_bubble_border" value={colorBubbleBorder} />
      <input type="hidden" name="widget_color_bubble_glow" value={colorBubbleGlow} />
      <input type="hidden" name="widget_launcher_icon" value={launcherIcon} />
      <input type="hidden" name="widget_launcher_logo_url" value={launcherLogoUrl} />

      <div className="flex flex-col gap-4 rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-violet-400/25 bg-violet-400/10 text-violet-200">
            <MousePointer2 className="h-4 w-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-semibold text-white">Click the widget to edit it</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              Select any highlighted area. Only its relevant controls will appear.
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-neutral-400/60 hover:text-white"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          Reset design
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#070b12] shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">Live canvas</p>
              <p className="mt-1 text-sm text-slate-400">Tap a part of the widget to customize it.</p>
            </div>
            <div className="inline-flex self-start rounded-xl border border-slate-800 bg-slate-950 p-1">
              {([
                { id: "desktop" as const, label: "Desktop", icon: Monitor },
                { id: "mobile" as const, label: "Mobile", icon: Smartphone },
              ]).map((viewport) => {
                const ViewportIcon = viewport.icon;
                const isActive = previewViewport === viewport.id;
                return (
                  <button
                    key={viewport.id}
                    type="button"
                    aria-pressed={isActive}
                    onClick={() => setPreviewViewport(viewport.id)}
                    className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold transition ${
                      isActive ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"
                    }`}
                  >
                    <ViewportIcon className="h-3.5 w-3.5" aria-hidden="true" />
                    {viewport.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex min-h-[760px] items-center justify-center overflow-auto bg-[radial-gradient(circle_at_top,rgba(139,92,246,.13),transparent_36%)] p-3 sm:p-6">
            <div
              className={`relative overflow-hidden border border-white/10 bg-black p-2 shadow-[0_26px_90px_rgba(0,0,0,.6)] transition-[width,border-radius] duration-300 ${
                previewViewport === "mobile"
                  ? "w-[390px] max-w-full rounded-[32px]"
                  : "w-full max-w-[980px] rounded-2xl"
              }`}
            >
              {previewViewport === "mobile" ? (
                <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full border border-white/10 bg-black/80" />
              ) : null}
              <iframe
                ref={iframeRef}
                key={iframeKey}
                title="Interactive widget preview"
                src={previewPageUrl}
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => {
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: "ai-widget-editor:select", part: selectedPart },
                    window.location.origin,
                  );
                }}
                className={`block w-full border-0 bg-slate-100 ${
                  previewViewport === "mobile" ? "h-[720px] rounded-[24px]" : "h-[720px] rounded-xl"
                }`}
              />
            </div>
          </div>
        </section>

        <aside className="min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start">
          <section className="overflow-hidden rounded-2xl border border-slate-800/80 bg-slate-950/60 shadow-xl shadow-black/20">
            <div className="border-b border-slate-800/80 p-4">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-slate-950">
                  <activePart.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">Editing</p>
                  <h2 className="mt-1 text-base font-semibold text-white">{activePart.label}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{activePart.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 border-b border-slate-800/80 p-2" aria-label="Widget parts">
              {editableParts.map((part) => {
                const PartIcon = part.icon;
                const isActive = selectedPart === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    title={part.label}
                    aria-label={`Edit ${part.label}`}
                    aria-pressed={isActive}
                    onClick={() => selectEditorPart(part.id)}
                    className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-lg px-1 text-[10px] font-semibold transition ${
                      isActive
                        ? "bg-violet-400 text-slate-950"
                        : "text-slate-500 hover:bg-slate-900 hover:text-slate-200"
                    }`}
                  >
                    <PartIcon className="h-4 w-4" aria-hidden="true" />
                    <span className="max-w-full truncate">{part.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="max-h-[calc(100vh-260px)] min-h-[360px] overflow-y-auto p-4">
              {selectedPart === "presets" ? (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Experience</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {widgetFormats.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={format === option}
                          onClick={() => setFormat(option)}
                          className={`rounded-xl border px-3 py-3 text-sm font-semibold capitalize transition ${
                            format === option
                              ? "border-violet-300 bg-violet-400/15 text-white"
                              : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-white"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  <div className="space-y-2">
                    {widgetTemplates.map((template) => {
                      const isSelected = selectedTemplateId === template.id;
                      return (
                        <button
                          key={template.id}
                          type="button"
                          aria-pressed={isSelected}
                          onClick={() => handleTemplateSelect(template.id)}
                          className={`group flex w-full items-center gap-3 rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? "border-violet-300 bg-violet-400/10 text-white"
                              : "border-slate-800 text-slate-300 hover:border-slate-600"
                          }`}
                        >
                          <span className="flex shrink-0 -space-x-1" aria-hidden="true">
                            {[
                              template.settings.appearance.colorHeaderBg,
                              template.settings.appearance.colorChatBg,
                              template.settings.appearance.colorUserBubbleBg,
                            ].map((color, index) => (
                              <span
                                key={`${color}-${index}`}
                                className="h-7 w-7 rounded-full border-2 border-slate-950"
                                style={{ backgroundColor: color }}
                              />
                            ))}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold">{template.name}</span>
                            <span className="mt-0.5 block truncate text-xs text-slate-500">{template.description}</span>
                          </span>
                          {isSelected ? <Check className="h-4 w-4 text-violet-200" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : null}

              {selectedPart === "header" ? (
                <div className="space-y-5">
                  <FieldInput
                    label="Visible name"
                    name="editor_widget_brand"
                    maxLength={widgetLimits.brand}
                    placeholder={widgetDefaults.brand}
                    value={brandInput}
                    onChange={setBrandInput}
                    helper="The name customers see in the widget header."
                  />
                  <FieldInput
                    label="Status line"
                    name="editor_widget_human_support_text"
                    maxLength={widgetLimits.humanSupportText}
                    placeholder={widgetDefaults.humanSupportText}
                    value={humanSupportTextInput}
                    onChange={setHumanSupportTextInput}
                    helper="Short availability or support message."
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <ColorInput label="Background" name="editor_header_bg" value={colorHeaderBg} onChange={setColorHeaderBg} defaultValue={appearanceDefaults.colorHeaderBg} />
                    <ColorInput label="Text" name="editor_header_text" value={colorHeaderText} onChange={setColorHeaderText} defaultValue={appearanceDefaults.colorHeaderText} />
                  </div>
                </div>
              ) : null}

              {selectedPart === "chat" ? (
                <div className="space-y-5">
                  <ColorInput
                    label="Main accent"
                    name="editor_accent"
                    value={accentInput}
                    onChange={setAccentInput}
                    defaultValue={accentDefault}
                    errorMessage="Use a 3- or 6-character hex value."
                  />
                  <ColorInput label="Chat background" name="editor_chat_bg" value={colorChatBg} onChange={setColorChatBg} defaultValue={appearanceDefaults.colorChatBg} />
                  <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs leading-5 text-slate-400">
                    The accent is reused for active controls and subtle highlights to keep the design coherent.
                  </p>
                </div>
              ) : null}

              {selectedPart === "botBubble" ? (
                <div className="space-y-5">
                  <ColorInput label="Bubble background" name="editor_bot_bg" value={colorBotBubbleBg} onChange={setColorBotBubbleBg} defaultValue={appearanceDefaults.colorBotBubbleBg} />
                  <ColorInput label="Message text" name="editor_bot_text" value={colorBotBubbleText} onChange={setColorBotBubbleText} defaultValue={appearanceDefaults.colorBotBubbleText} />
                </div>
              ) : null}

              {selectedPart === "userBubble" ? (
                <div className="space-y-5">
                  <ColorInput label="Bubble background" name="editor_user_bg" value={colorUserBubbleBg} onChange={setColorUserBubbleBg} defaultValue={appearanceDefaults.colorUserBubbleBg} />
                  <ColorInput label="Message text" name="editor_user_text" value={colorUserBubbleText} onChange={setColorUserBubbleText} defaultValue={appearanceDefaults.colorUserBubbleText} />
                </div>
              ) : null}

              {selectedPart === "composer" ? (
                <div className="space-y-5">
                  <FieldInput
                    label="Welcome message"
                    name="editor_widget_greeting"
                    maxLength={widgetLimits.greeting}
                    placeholder={widgetDefaults.greeting}
                    value={greetingInput}
                    onChange={setGreetingInput}
                    helper="The first message shown when the conversation opens."
                  />
                </div>
              ) : null}

              {selectedPart === "launcher" ? (
                <div className="space-y-5">
                  <FieldInput
                    label="Button text"
                    name="editor_widget_label"
                    maxLength={widgetLimits.label}
                    placeholder={widgetDefaults.label}
                    value={labelInput}
                    onChange={setLabelInput}
                    helper="Shown beside the launcher icon."
                  />
                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Launcher style</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2">
                      {widgetLauncherStyles.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={launcherStyle === option}
                          onClick={() => handleLauncherStyleChange(option)}
                          className={`rounded-xl border px-3 py-3 text-left transition ${
                            launcherStyle === option
                              ? "border-violet-300 bg-violet-400/10 text-white"
                              : "border-slate-800 text-slate-400 hover:border-slate-700"
                          }`}
                        >
                          <span className="block text-sm font-semibold">{launcherStyleLabels[option]}</span>
                          <span className="mt-1 block text-[11px] leading-4 text-slate-500">{launcherStyleHelp[option]}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {launcherStyle === "card" ? (
                    <FieldInput
                      label="Subtitle"
                      name="editor_bubble_subtitle"
                      maxLength={widgetLimits.bubbleSubtitle}
                      placeholder={widgetDefaults.bubbleSubtitle}
                      value={bubbleSubtitleInput}
                      onChange={setBubbleSubtitleInput}
                      helper="Secondary line inside the launcher card."
                    />
                  ) : null}

                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Icon</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {widgetLauncherIcons.map((option) => {
                        const OptionIcon = option === "sparkles" ? Sparkles : option === "bot" ? Bot : option === "store" ? Store : option === "logo" ? ImageIcon : MessageSquare;
                        return (
                          <button
                            key={option}
                            type="button"
                            title={launcherIconLabels[option]}
                            aria-label={launcherIconLabels[option]}
                            aria-pressed={launcherIcon === option}
                            onClick={() => setLauncherIcon(option)}
                            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-semibold transition ${
                              launcherIcon === option
                                ? "border-violet-300 bg-violet-400/15 text-white"
                                : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white"
                            }`}
                          >
                            <OptionIcon className="h-5 w-5" aria-hidden="true" />
                            {launcherIconLabels[option]}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {launcherIcon === "logo" ? (
                    <div className="space-y-2">
                      <label htmlFor="editor_launcher_logo_url" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Logo image URL</label>
                      <input
                        id="editor_launcher_logo_url"
                        type="url"
                        inputMode="url"
                        maxLength={widgetLimits.launcherLogoUrl}
                        placeholder="https://example.com/logo.svg"
                        value={launcherLogoUrl}
                        onChange={(event) => setLauncherLogoUrl(event.target.value)}
                        className={inputClass}
                      />
                    </div>
                  ) : null}

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <ColorInput label="Background" name="editor_toggle_bg" value={colorToggleBg} onChange={setColorToggleBg} defaultValue={appearanceDefaults.colorToggleBg} />
                    <ColorInput label="Icon color" name="editor_toggle_text" value={colorToggleText} onChange={setColorToggleText} defaultValue={appearanceDefaults.colorToggleText} />
                  </div>

                  {launcherStyle === "card" ? (
                    <details className="rounded-xl border border-slate-800 p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">Card details</summary>
                      <div className="mt-4 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <RangeInput label="Width" name="editor_bubble_width" value={bubbleWidth} onChange={setBubbleWidth} min={widgetLimits.bubbleWidth.min} max={widgetLimits.bubbleWidth.max} />
                          <RangeInput label="Corners" name="editor_bubble_radius" value={bubbleRadius} onChange={setBubbleRadius} min={widgetLimits.bubbleRadius.min} max={widgetLimits.bubbleRadius.max} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ label: "3D glow", value: true }, { label: "Static", value: false }].map((option) => (
                            <button
                              key={option.label}
                              type="button"
                              aria-pressed={bubbleUseThree === option.value}
                              onClick={() => setBubbleUseThree(option.value)}
                              className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${bubbleUseThree === option.value ? "bg-white text-slate-950" : "bg-slate-900 text-slate-400"}`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <ColorInput label="Card background" name="editor_bubble_bg" value={colorBubbleBg} onChange={setColorBubbleBg} defaultValue={appearanceDefaults.colorBubbleBg} />
                        <ColorInput label="Title" name="editor_bubble_text" value={colorBubbleText} onChange={setColorBubbleText} defaultValue={appearanceDefaults.colorBubbleText} />
                        <ColorInput label="Subtitle" name="editor_bubble_subtext" value={colorBubbleSubtext} onChange={setColorBubbleSubtext} defaultValue={appearanceDefaults.colorBubbleSubtext} />
                        <ColorInput label="Border" name="editor_bubble_border" value={colorBubbleBorder} onChange={setColorBubbleBorder} defaultValue={appearanceDefaults.colorBubbleBorder} />
                        <ColorInput label="Glow" name="editor_bubble_glow" value={colorBubbleGlow} onChange={setColorBubbleGlow} defaultValue={appearanceDefaults.colorBubbleGlow} />
                      </div>
                    </details>
                  ) : null}
                </div>
              ) : null}

              {selectedPart === "layout" ? (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Screen side</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 p-1.5">
                      {widgetPositions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={position === option}
                          onClick={() => setPosition(option)}
                          className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition ${position === option ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <RangeInput label="Widget width" name="editor_width" value={width} onChange={setWidth} min={widgetLimits.width.min} max={widgetLimits.width.max} />
                  <RangeInput label="Widget height" name="editor_height" value={height} onChange={setHeight} min={widgetLimits.height.min} max={widgetLimits.height.max} />
                  <RangeInput label="Side spacing" name="editor_offset_x" value={offsetX} onChange={setOffsetX} min={widgetLimits.offsetX.min} max={widgetLimits.offsetX.max} />
                  <RangeInput label="Bottom spacing" name="editor_offset_y" value={offsetY} onChange={setOffsetY} min={widgetLimits.offsetY.min} max={widgetLimits.offsetY.max} />
                  <RangeInput label="Launcher size" name="editor_launcher_size" value={launcherSize} onChange={setLauncherSize} min={widgetLimits.launcherSize.min} max={widgetLimits.launcherSize.max} />
                  <RangeInput label="Widget corners" name="editor_border_radius" value={borderRadius} onChange={setBorderRadius} min={widgetLimits.borderRadius.min} max={widgetLimits.borderRadius.max} />
                  <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs leading-5 text-slate-400">
                    <Move className="mt-0.5 h-4 w-4 shrink-0 text-violet-200" aria-hidden="true" />
                    Mobile automatically keeps a safe full-width layout.
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <details className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              <span className="flex items-center gap-2"><Frame className="h-4 w-4 text-violet-200" aria-hidden="true" />Installation code</span>
              <span className="text-slate-600">Advanced</span>
            </summary>
            <div className="mt-4 space-y-3">
              <code className="block max-h-28 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-slate-300 break-all">{embedSnippet}</code>
              <button
                type="button"
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-violet-400/60 hover:text-white"
              >
                {copyState === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />}
                {copyState === "copied" ? "Copied" : "Copy code"}
              </button>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
