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
  getWidgetCopyDefaults,
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
  localizeWidgetTemplate,
  type WidgetTemplateId,
  widgetTemplates as baseWidgetTemplates,
} from "@/lib/widget/templates";
import { useI18n } from "@/lib/i18n/client";
import { format as formatMessage } from "@/lib/i18n/config";

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

const editablePartIcons: Array<{ id: EditablePart; icon: LucideIcon }> = [
  { id: "presets", icon: WandSparkles },
  { id: "header", icon: Type },
  { id: "chat", icon: Palette },
  { id: "botBubble", icon: Bot },
  { id: "userBubble", icon: MessageSquare },
  { id: "composer", icon: Sparkles },
  { id: "launcher", icon: ImageIcon },
  { id: "layout", icon: Maximize2 },
];

const editablePartIds = new Set(editablePartIcons.map((part) => part.id));

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

const inputClass =
  "w-full min-w-0 rounded-xl border border-slate-800 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-neutral-400 focus:ring-2 focus:ring-neutral-400/30";

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
  const { t } = useI18n();

  return (
    <div className="space-y-2 min-w-0">
      <div className="flex items-end justify-between gap-3">
        <label
          htmlFor={name}
          className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400"
        >
          {label}
        </label>
        <span className="text-[11px] text-slate-500">{formatMessage(t.widgetEditor.charsLeft, { count: remaining })}</span>
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
  errorMessage,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  defaultValue: string;
  errorMessage?: string;
}) {
  const pickerValue = normalizeHex(value) ?? defaultValue;
  const { t } = useI18n();
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
            {t.widgetEditor.reset}
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 min-w-0">
        <input
          type="color"
          aria-label={formatMessage(t.widgetEditor.colorPicker, { label })}
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
        <p className="text-xs text-rose-300">{errorMessage ?? t.widgetEditor.invalidHex}</p>
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
  const { t } = useI18n();
  const w = t.widgetEditor;
  const f = w.fields;
  const editableParts = editablePartIcons.map((part) => ({
    ...part,
    ...w.parts[part.id],
  }));
  const editablePartMap = new Map(editableParts.map((part) => [part.id, part]));
  const widgetTemplates = baseWidgetTemplates.map((template) =>
    localizeWidgetTemplate(template, t.widgetTemplates[template.id]),
  );
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

  const copyDefaults = getWidgetCopyDefaults(initialLanguage);
  const livePreviewConfig = useMemo(() => {
    const resolvedBrand =
      brandInput.trim().slice(0, widgetLimits.brand) || widgetDefaults.brand;

    return {
      format,
      language: initialLanguage ?? "auto",
      accent: normalizeHex(accentInput) ?? accentDefault,
      brandName: resolvedBrand,
      brandInitial: (resolvedBrand.charAt(0).toUpperCase() || "A").slice(0, 1),
      collapsedLabel:
        labelInput.trim().slice(0, widgetLimits.label) || copyDefaults.label,
      greeting:
        greetingInput.trim().slice(0, widgetLimits.greeting) ||
        copyDefaults.greeting,
      humanSupportText:
        humanSupportTextInput
          .trim()
          .slice(0, widgetLimits.humanSupportText) ||
        copyDefaults.humanSupportText,
      launcherIcon,
      launcherLogoUrl:
        launcherLogoUrl.trim().slice(0, widgetLimits.launcherLogoUrl) || null,
      launcherStyle,
      bubbleSubtitle:
        bubbleSubtitleInput.trim().slice(0, widgetLimits.bubbleSubtitle) ||
        widgetDefaults.bubbleSubtitle,
      bubbleUseThree,
      bubbleWidth,
      bubbleRadius,
      position,
      width,
      height,
      offsetX,
      offsetY,
      launcherSize,
      borderRadius,
      appearance: {
        colorHeaderBg:
          normalizeHex(colorHeaderBg) ?? appearanceDefaults.colorHeaderBg,
        colorHeaderText:
          normalizeHex(colorHeaderText) ?? appearanceDefaults.colorHeaderText,
        colorChatBg:
          normalizeHex(colorChatBg) ?? appearanceDefaults.colorChatBg,
        colorUserBubbleBg:
          normalizeHex(colorUserBubbleBg) ??
          appearanceDefaults.colorUserBubbleBg,
        colorUserBubbleText:
          normalizeHex(colorUserBubbleText) ??
          appearanceDefaults.colorUserBubbleText,
        colorBotBubbleBg:
          normalizeHex(colorBotBubbleBg) ?? appearanceDefaults.colorBotBubbleBg,
        colorBotBubbleText:
          normalizeHex(colorBotBubbleText) ??
          appearanceDefaults.colorBotBubbleText,
        colorToggleBg:
          normalizeHex(colorToggleBg) ?? appearanceDefaults.colorToggleBg,
        colorToggleText:
          normalizeHex(colorToggleText) ?? appearanceDefaults.colorToggleText,
        colorBubbleBg:
          normalizeHex(colorBubbleBg) ?? appearanceDefaults.colorBubbleBg,
        colorBubbleText:
          normalizeHex(colorBubbleText) ?? appearanceDefaults.colorBubbleText,
        colorBubbleSubtext:
          normalizeHex(colorBubbleSubtext) ??
          appearanceDefaults.colorBubbleSubtext,
        colorBubbleBorder:
          normalizeHex(colorBubbleBorder) ??
          appearanceDefaults.colorBubbleBorder,
        colorBubbleGlow:
          normalizeHex(colorBubbleGlow) ?? appearanceDefaults.colorBubbleGlow,
      },
    };
  }, [
    accentDefault,
    accentInput,
    appearanceDefaults,
    borderRadius,
    brandInput,
    bubbleRadius,
    bubbleSubtitleInput,
    bubbleUseThree,
    bubbleWidth,
    colorBotBubbleBg,
    colorBotBubbleText,
    colorBubbleBg,
    colorBubbleBorder,
    colorBubbleGlow,
    colorBubbleSubtext,
    colorBubbleText,
    colorChatBg,
    colorHeaderBg,
    colorHeaderText,
    colorToggleBg,
    colorToggleText,
    colorUserBubbleBg,
    colorUserBubbleText,
    copyDefaults,
    format,
    greetingInput,
    height,
    humanSupportTextInput,
    initialLanguage,
    labelInput,
    launcherIcon,
    launcherLogoUrl,
    launcherSize,
    launcherStyle,
    offsetX,
    offsetY,
    position,
    width,
  ]);

  const previewPageUrl = useMemo(() => {
    const params = new URLSearchParams({
      key: apiKey,
      preview: "1",
      open: "1",
      format,
    });
    return `/widget/preview?${params.toString()}`;
  }, [apiKey, format]);

  const livePreviewConfigRef = useRef(livePreviewConfig);
  const selectedPartRef = useRef(selectedPart);

  useEffect(() => {
    livePreviewConfigRef.current = livePreviewConfig;
    iframeRef.current?.contentWindow?.postMessage(
      { type: "ai-widget-editor:update", config: livePreviewConfig },
      window.location.origin,
    );
  }, [livePreviewConfig]);

  useEffect(() => {
    selectedPartRef.current = selectedPart;
  }, [selectedPart]);

  useEffect(() => {
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.source !== iframeRef.current?.contentWindow) return;

      if (event.data?.type === "ai-widget-editor:ready") {
        iframeRef.current?.contentWindow?.postMessage(
          {
            type: "ai-widget-editor:update",
            config: livePreviewConfigRef.current,
          },
          window.location.origin,
        );
        iframeRef.current?.contentWindow?.postMessage(
          { type: "ai-widget-editor:select", part: selectedPartRef.current },
          window.location.origin,
        );
        return;
      }

      if (event.data?.type === "ai-widget-editor:text-change") {
        const value = String(event.data.value ?? "");
        switch (event.data.field) {
          case "brandName":
            setBrandInput(value.slice(0, widgetLimits.brand));
            setSelectedPart("header");
            break;
          case "humanSupportText":
            setHumanSupportTextInput(
              value.slice(0, widgetLimits.humanSupportText),
            );
            setSelectedPart("header");
            break;
          case "collapsedLabel":
            setLabelInput(value.slice(0, widgetLimits.label));
            setSelectedPart("launcher");
            break;
          case "bubbleSubtitle":
            setBubbleSubtitleInput(value.slice(0, widgetLimits.bubbleSubtitle));
            setSelectedPart("launcher");
            break;
          case "greeting":
            setGreetingInput(value.slice(0, widgetLimits.greeting));
            setSelectedPart("composer");
            break;
        }
        return;
      }

      if (event.data?.type !== "ai-widget-editor:select") return;
      if (!editablePartIds.has(event.data.part as EditablePart)) return;
      setSelectedPart(event.data.part as EditablePart);
    };

    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, []);

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
            <p className="text-sm font-semibold text-white">{w.hintTitle}</p>
            <p className="mt-1 text-xs leading-5 text-slate-400">
              {w.hintBody}
            </p>
          </div>
        </div>
        <button
          type="button"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-neutral-400/60 hover:text-white"
          onClick={handleReset}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
          {w.resetDesign}
        </button>
      </div>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-800/80 bg-[#070b12] shadow-2xl shadow-black/25">
          <div className="flex flex-col gap-3 border-b border-slate-800/80 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-200">{w.liveCanvas}</p>
              <p className="mt-1 text-sm text-slate-400">{w.liveCanvasHint}</p>
            </div>
            <div className="inline-flex self-start rounded-xl border border-slate-800 bg-slate-950 p-1">
              {([
                { id: "desktop" as const, label: w.desktop, icon: Monitor },
                { id: "mobile" as const, label: w.mobile, icon: Smartphone },
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
                key={format}
                title={w.previewTitle}
                src={previewPageUrl}
                sandbox="allow-scripts allow-same-origin"
                onLoad={() => {
                  iframeRef.current?.contentWindow?.postMessage(
                    { type: "ai-widget-editor:update", config: livePreviewConfig },
                    window.location.origin,
                  );
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
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-200">{w.editing}</p>
                  <h2 className="mt-1 text-base font-semibold text-white">{activePart.label}</h2>
                  <p className="mt-1 text-xs leading-5 text-slate-400">{activePart.description}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-1 border-b border-slate-800/80 p-2" aria-label={w.partsAria}>
              {editableParts.map((part) => {
                const PartIcon = part.icon;
                const isActive = selectedPart === part.id;
                return (
                  <button
                    key={part.id}
                    type="button"
                    title={part.label}
                    aria-label={formatMessage(w.editPart, { label: part.label })}
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
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{w.experience}</legend>
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
                          {w.formats[option]}
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
                    label={f.visibleName}
                    name="editor_widget_brand"
                    maxLength={widgetLimits.brand}
                    placeholder={widgetDefaults.brand}
                    value={brandInput}
                    onChange={setBrandInput}
                    helper={f.visibleNameHelp}
                  />
                  <FieldInput
                    label={f.statusLine}
                    name="editor_widget_human_support_text"
                    maxLength={widgetLimits.humanSupportText}
                    placeholder={widgetDefaults.humanSupportText}
                    value={humanSupportTextInput}
                    onChange={setHumanSupportTextInput}
                    helper={f.statusLineHelp}
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-1">
                    <ColorInput label={f.background} name="editor_header_bg" value={colorHeaderBg} onChange={setColorHeaderBg} defaultValue={appearanceDefaults.colorHeaderBg} />
                    <ColorInput label={f.text} name="editor_header_text" value={colorHeaderText} onChange={setColorHeaderText} defaultValue={appearanceDefaults.colorHeaderText} />
                  </div>
                </div>
              ) : null}

              {selectedPart === "chat" ? (
                <div className="space-y-5">
                  <ColorInput
                    label={f.mainAccent}
                    name="editor_accent"
                    value={accentInput}
                    onChange={setAccentInput}
                    defaultValue={accentDefault}
                    errorMessage={w.invalidHexShort}
                  />
                  <ColorInput label={f.chatBackground} name="editor_chat_bg" value={colorChatBg} onChange={setColorChatBg} defaultValue={appearanceDefaults.colorChatBg} />
                  <p className="rounded-xl border border-slate-800 bg-slate-900/50 p-3 text-xs leading-5 text-slate-400">
                    {f.accentNote}
                  </p>
                </div>
              ) : null}

              {selectedPart === "botBubble" ? (
                <div className="space-y-5">
                  <ColorInput label={f.bubbleBackground} name="editor_bot_bg" value={colorBotBubbleBg} onChange={setColorBotBubbleBg} defaultValue={appearanceDefaults.colorBotBubbleBg} />
                  <ColorInput label={f.messageText} name="editor_bot_text" value={colorBotBubbleText} onChange={setColorBotBubbleText} defaultValue={appearanceDefaults.colorBotBubbleText} />
                </div>
              ) : null}

              {selectedPart === "userBubble" ? (
                <div className="space-y-5">
                  <ColorInput label={f.bubbleBackground} name="editor_user_bg" value={colorUserBubbleBg} onChange={setColorUserBubbleBg} defaultValue={appearanceDefaults.colorUserBubbleBg} />
                  <ColorInput label={f.messageText} name="editor_user_text" value={colorUserBubbleText} onChange={setColorUserBubbleText} defaultValue={appearanceDefaults.colorUserBubbleText} />
                </div>
              ) : null}

              {selectedPart === "composer" ? (
                <div className="space-y-5">
                  <FieldInput
                    label={f.welcome}
                    name="editor_widget_greeting"
                    maxLength={widgetLimits.greeting}
                    placeholder={widgetDefaults.greeting}
                    value={greetingInput}
                    onChange={setGreetingInput}
                    helper={f.welcomeHelp}
                  />
                </div>
              ) : null}

              {selectedPart === "launcher" ? (
                <div className="space-y-5">
                  <FieldInput
                    label={f.buttonText}
                    name="editor_widget_label"
                    maxLength={widgetLimits.label}
                    placeholder={widgetDefaults.label}
                    value={labelInput}
                    onChange={setLabelInput}
                    helper={f.buttonTextHelp}
                  />
                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{f.launcherStyle}</legend>
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
                          <span className="block text-sm font-semibold">{w.launcherStyles[option].label}</span>
                          <span className="mt-1 block text-[11px] leading-4 text-slate-500">{w.launcherStyles[option].help}</span>
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {launcherStyle === "card" ? (
                    <FieldInput
                      label={f.subtitle}
                      name="editor_bubble_subtitle"
                      maxLength={widgetLimits.bubbleSubtitle}
                      placeholder={widgetDefaults.bubbleSubtitle}
                      value={bubbleSubtitleInput}
                      onChange={setBubbleSubtitleInput}
                      helper={f.subtitleHelp}
                    />
                  ) : null}

                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{f.icon}</legend>
                    <div className="mt-2 grid grid-cols-3 gap-2">
                      {widgetLauncherIcons.map((option) => {
                        const OptionIcon = option === "sparkles" ? Sparkles : option === "bot" ? Bot : option === "store" ? Store : option === "logo" ? ImageIcon : MessageSquare;
                        return (
                          <button
                            key={option}
                            type="button"
                            title={w.launcherIcons[option]}
                            aria-label={w.launcherIcons[option]}
                            aria-pressed={launcherIcon === option}
                            onClick={() => setLauncherIcon(option)}
                            className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-xl border text-[10px] font-semibold transition ${
                              launcherIcon === option
                                ? "border-violet-300 bg-violet-400/15 text-white"
                                : "border-slate-800 text-slate-500 hover:border-slate-700 hover:text-white"
                            }`}
                          >
                            <OptionIcon className="h-5 w-5" aria-hidden="true" />
                            {w.launcherIcons[option]}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>

                  {launcherIcon === "logo" ? (
                    <div className="space-y-2">
                      <label htmlFor="editor_launcher_logo_url" className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{f.logoUrl}</label>
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
                    <ColorInput label={f.background} name="editor_toggle_bg" value={colorToggleBg} onChange={setColorToggleBg} defaultValue={appearanceDefaults.colorToggleBg} />
                    <ColorInput label={f.iconColor} name="editor_toggle_text" value={colorToggleText} onChange={setColorToggleText} defaultValue={appearanceDefaults.colorToggleText} />
                  </div>

                  {launcherStyle === "card" ? (
                    <details className="rounded-xl border border-slate-800 p-3">
                      <summary className="cursor-pointer text-xs font-semibold uppercase tracking-[0.15em] text-slate-300">{f.cardDetails}</summary>
                      <div className="mt-4 space-y-5">
                        <div className="grid grid-cols-2 gap-4">
                          <RangeInput label={f.width} name="editor_bubble_width" value={bubbleWidth} onChange={setBubbleWidth} min={widgetLimits.bubbleWidth.min} max={widgetLimits.bubbleWidth.max} />
                          <RangeInput label={f.corners} name="editor_bubble_radius" value={bubbleRadius} onChange={setBubbleRadius} min={widgetLimits.bubbleRadius.min} max={widgetLimits.bubbleRadius.max} />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          {[{ label: f.glow3d, value: true }, { label: f.static, value: false }].map((option) => (
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
                        <ColorInput label={f.cardBackground} name="editor_bubble_bg" value={colorBubbleBg} onChange={setColorBubbleBg} defaultValue={appearanceDefaults.colorBubbleBg} />
                        <ColorInput label={f.title} name="editor_bubble_text" value={colorBubbleText} onChange={setColorBubbleText} defaultValue={appearanceDefaults.colorBubbleText} />
                        <ColorInput label={f.subtitle} name="editor_bubble_subtext" value={colorBubbleSubtext} onChange={setColorBubbleSubtext} defaultValue={appearanceDefaults.colorBubbleSubtext} />
                        <ColorInput label={f.border} name="editor_bubble_border" value={colorBubbleBorder} onChange={setColorBubbleBorder} defaultValue={appearanceDefaults.colorBubbleBorder} />
                        <ColorInput label={f.glow} name="editor_bubble_glow" value={colorBubbleGlow} onChange={setColorBubbleGlow} defaultValue={appearanceDefaults.colorBubbleGlow} />
                      </div>
                    </details>
                  ) : null}
                </div>
              ) : null}

              {selectedPart === "layout" ? (
                <div className="space-y-5">
                  <fieldset>
                    <legend className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">{f.screenSide}</legend>
                    <div className="mt-2 grid grid-cols-2 gap-2 rounded-xl border border-slate-800 p-1.5">
                      {widgetPositions.map((option) => (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={position === option}
                          onClick={() => setPosition(option)}
                          className={`rounded-lg px-4 py-2.5 text-sm font-semibold capitalize transition ${position === option ? "bg-white text-slate-950" : "text-slate-400 hover:text-white"}`}
                        >
                          {w.positions[option]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                  <RangeInput label={f.widgetWidth} name="editor_width" value={width} onChange={setWidth} min={widgetLimits.width.min} max={widgetLimits.width.max} />
                  <RangeInput label={f.widgetHeight} name="editor_height" value={height} onChange={setHeight} min={widgetLimits.height.min} max={widgetLimits.height.max} />
                  <RangeInput label={f.sideSpacing} name="editor_offset_x" value={offsetX} onChange={setOffsetX} min={widgetLimits.offsetX.min} max={widgetLimits.offsetX.max} />
                  <RangeInput label={f.bottomSpacing} name="editor_offset_y" value={offsetY} onChange={setOffsetY} min={widgetLimits.offsetY.min} max={widgetLimits.offsetY.max} />
                  <RangeInput label={f.launcherSize} name="editor_launcher_size" value={launcherSize} onChange={setLauncherSize} min={widgetLimits.launcherSize.min} max={widgetLimits.launcherSize.max} />
                  <RangeInput label={f.widgetCorners} name="editor_border_radius" value={borderRadius} onChange={setBorderRadius} min={widgetLimits.borderRadius.min} max={widgetLimits.borderRadius.max} />
                  <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/40 p-3 text-xs leading-5 text-slate-400">
                    <Move className="mt-0.5 h-4 w-4 shrink-0 text-violet-200" aria-hidden="true" />
                    {f.mobileNote}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <details className="rounded-2xl border border-slate-800/80 bg-slate-950/45 p-4">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">
              <span className="flex items-center gap-2"><Frame className="h-4 w-4 text-violet-200" aria-hidden="true" />{w.installCode}</span>
              <span className="text-slate-600">{w.advanced}</span>
            </summary>
            <div className="mt-4 space-y-3">
              <code className="block max-h-28 overflow-auto rounded-xl border border-slate-800 bg-slate-950 p-3 font-mono text-[10px] leading-relaxed text-slate-300 break-all">{embedSnippet}</code>
              <button
                type="button"
                onClick={handleCopySnippet}
                className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-violet-400/60 hover:text-white"
              >
                {copyState === "copied" ? <Check className="h-3.5 w-3.5" aria-hidden="true" /> : <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />}
                {copyState === "copied" ? w.copied : w.copyCode}
              </button>
            </div>
          </details>
        </aside>
      </div>
    </div>
  );
}
