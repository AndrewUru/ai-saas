"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Bot,
  Check,
  Clipboard,
  Image as ImageIcon,
  Maximize2,
  type LucideIcon,
  MessageSquare,
  MonitorSmartphone,
  Move,
  Palette,
  RotateCcw,
  SlidersHorizontal,
  Store,
  Type,
} from "lucide-react";
import {
  type WidgetLauncherIcon,
  widgetDefaults,
  widgetLauncherIcons,
  widgetLimits,
  widgetPositions,
  WidgetPosition,
} from "@/lib/widget/defaults";
import { getEmbedSnippet } from "@/lib/widget/embedSnippet";

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
  initialPosition: WidgetPosition | null;
  initialWidth: number | null;
  initialHeight: number | null;
  initialOffsetX: number | null;
  initialOffsetY: number | null;
  initialLauncherSize: number | null;
  initialBorderRadius: number | null;

  initialColorHeaderBg: string | null;
  initialColorHeaderText: string | null;
  initialColorChatBg: string | null;
  initialColorUserBubbleBg: string | null;
  initialColorUserBubbleText: string | null;
  initialColorBotBubbleBg: string | null;
  initialColorBotBubbleText: string | null;
  initialColorToggleBg: string | null;
  initialColorToggleText: string | null;
  initialLauncherIcon: WidgetLauncherIcon | string | null;
  initialLauncherLogoUrl: string | null;
};

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
  "w-full min-w-0 rounded-xl border border-slate-800 px-3.5 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30";

const launcherIconLabels: Record<WidgetLauncherIcon, string> = {
  whatsapp: "WhatsApp",
  chat: "Chat",
  bot: "Bot",
  store: "Store",
  logo: "Logo URL",
};

const launcherIconHelp: Record<WidgetLauncherIcon, string> = {
  whatsapp: "Familiar green support launcher.",
  chat: "Neutral chat bubble.",
  bot: "Assistant style icon.",
  store: "Commerce storefront icon.",
  logo: "Use an image or SVG URL.",
};

function normalizeLauncherIcon(value: string | null): WidgetLauncherIcon {
  return widgetLauncherIcons.includes(value as WidgetLauncherIcon)
    ? (value as WidgetLauncherIcon)
    : widgetDefaults.launcherIcon;
}

function SectionCard({
  icon: Icon,
  eyebrow,
  title,
  children,
}: {
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-800/80 p-4 shadow-sm shadow-slate-950/20">
      <div className="mb-4 flex items-start gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-emerald-400/25 bg-emerald-400/10 text-emerald-200">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200">
            {eyebrow}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-white">{title}</h3>
        </div>
      </div>
      {children}
    </section>
  );
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
            className="text-[11px] font-semibold text-slate-500 transition hover:text-emerald-200"
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
              : "border-slate-800 focus:border-emerald-400 focus:ring-emerald-400/30"
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
        <span className="rounded-full border border-slate-800 px-2 py-0.5 text-[11px] font-semibold text-emerald-100">
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
        className="w-full accent-emerald-400"
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
  initialPosition,
  initialWidth,
  initialHeight,
  initialOffsetX,
  initialOffsetY,
  initialLauncherSize,
  initialBorderRadius,
  initialColorHeaderBg,
  initialColorHeaderText,
  initialColorChatBg,
  initialColorUserBubbleBg,
  initialColorUserBubbleText,
  initialColorBotBubbleBg,
  initialColorBotBubbleText,
  initialColorToggleBg,
  initialColorToggleText,
  initialLauncherIcon,
  initialLauncherLogoUrl,
}: WidgetDesignerProps) {
  const [accentInput, setAccentInput] = useState(initialAccent ?? "");
  const [brandInput, setBrandInput] = useState(initialBrand ?? "");
  const [labelInput, setLabelInput] = useState(initialLabel ?? "");
  const [greetingInput, setGreetingInput] = useState(initialGreeting ?? "");
  const [humanSupportTextInput, setHumanSupportTextInput] = useState(
    initialHumanSupportText ?? "",
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
  const [launcherIcon, setLauncherIcon] = useState<WidgetLauncherIcon>(
    normalizeLauncherIcon(initialLauncherIcon),
  );
  const [launcherLogoUrl, setLauncherLogoUrl] = useState(
    initialLauncherLogoUrl ?? "",
  );
  const [copyState, setCopyState] = useState<"idle" | "copied">("idle");

  const embedSnippet = getEmbedSnippet(apiKey);

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
      position,
      width,
      height,
      offsetX,
      offsetY,
      launcherSize,
      borderRadius,
      colorHeaderBg,
      colorHeaderText,
      colorChatBg,
      colorUserBubbleBg,
      colorUserBubbleText,
      colorBotBubbleBg,
      colorBotBubbleText,
      colorToggleBg,
      colorToggleText,
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
      position,
      width,
      height,
      offsetX,
      offsetY,
      launcherSize,
      borderRadius,
      colorHeaderBg,
      colorHeaderText,
      colorChatBg,
      colorUserBubbleBg,
      colorUserBubbleText,
      colorBotBubbleBg,
      colorBotBubbleText,
      colorToggleBg,
      colorToggleText,
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
    params.set("position", liveState.position);
    params.set("width", String(liveState.width));
    params.set("height", String(liveState.height));
    params.set("offsetX", String(liveState.offsetX));
    params.set("offsetY", String(liveState.offsetY));
    params.set("launcherSize", String(liveState.launcherSize));
    params.set("borderRadius", String(liveState.borderRadius));

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
      liveState.position,
      liveState.width,
      liveState.height,
      liveState.offsetX,
      liveState.offsetY,
      liveState.launcherSize,
      liveState.borderRadius,
    ].join("|");
  }, [liveState]);

  function handleReset() {
    setAccentInput("");
    setBrandInput("");
    setLabelInput("");
    setGreetingInput("");
    setHumanSupportTextInput("");
    setPosition(widgetDefaults.position);
    setWidth(widgetDefaults.width);
    setHeight(widgetDefaults.height);
    setOffsetX(widgetDefaults.offsetX);
    setOffsetY(widgetDefaults.offsetY);
    setLauncherSize(widgetDefaults.launcherSize);
    setBorderRadius(widgetDefaults.borderRadius);
    setColorHeaderBg("");
    setColorHeaderText("");
    setColorChatBg("");
    setColorUserBubbleBg("");
    setColorUserBubbleText("");
    setColorBotBubbleBg("");
    setColorBotBubbleText("");
    setColorToggleBg("");
    setColorToggleText("");
    setLauncherIcon(widgetDefaults.launcherIcon);
    setLauncherLogoUrl("");
  }

  function handleCopySnippet() {
    navigator.clipboard.writeText(embedSnippet);
    setCopyState("copied");
    window.setTimeout(() => setCopyState("idle"), 1600);
  }

  return (
    <div
      className="
        mt-6 grid grid-cols-1 gap-5
        lg:grid-cols-[minmax(0,1.05fr)_minmax(340px,0.95fr)]
        xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]
        w-full min-w-0
      "
    >
      <div className="space-y-4 min-w-0">
        <div className="rounded-2xl border border-slate-800/80 p-4 sm:p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
                Widget studio
              </p>
              <h2 className="mt-2 text-lg font-semibold text-white">
                Tune the chat experience
              </h2>
              <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-400">
                Changes update the preview automatically. Leave a field empty to
                keep the default value.
              </p>
            </div>

            <button
              type="button"
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-700 px-4 py-2 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
              onClick={handleReset}
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
              Defaults
            </button>
          </div>
        </div>

        <SectionCard
          icon={Palette}
          eyebrow="Colors"
          title="Set the widget palette"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 rounded-xl border border-emerald-400/20 p-3">
              <ColorInput
                label="Main accent"
                name="widget_accent"
                value={accentInput}
                onChange={setAccentInput}
                defaultValue={widgetDefaults.accent}
                errorMessage="Use a 3- or 6-character hex value."
              />
            </div>
            <ColorInput
              label="Header bg"
              name="widget_color_header_bg"
              value={colorHeaderBg}
              onChange={setColorHeaderBg}
              defaultValue="#075e54"
            />

            <ColorInput
              label="Header text"
              name="widget_color_header_text"
              value={colorHeaderText}
              onChange={setColorHeaderText}
              defaultValue="#ffffff"
            />

            <ColorInput
              label="Chat background"
              name="widget_color_chat_bg"
              value={colorChatBg}
              onChange={setColorChatBg}
              defaultValue="#efeae2"
            />

            <ColorInput
              label="User bubble bg"
              name="widget_color_user_bubble_bg"
              value={colorUserBubbleBg}
              onChange={setColorUserBubbleBg}
              defaultValue="#d9fdd3"
            />

            <ColorInput
              label="User text"
              name="widget_color_user_bubble_text"
              value={colorUserBubbleText}
              onChange={setColorUserBubbleText}
              defaultValue="#0b2f20"
            />

            <ColorInput
              label="Bot bubble bg"
              name="widget_color_bot_bubble_bg"
              value={colorBotBubbleBg}
              onChange={setColorBotBubbleBg}
              defaultValue="#ffffff"
            />

            <ColorInput
              label="Bot text"
              name="widget_color_bot_bubble_text"
              value={colorBotBubbleText}
              onChange={setColorBotBubbleText}
              defaultValue="#0f172a"
            />

            <ColorInput
              label="Launcher bg"
              name="widget_color_toggle_bg"
              value={colorToggleBg}
              onChange={setColorToggleBg}
              defaultValue="#25d366"
            />

            <ColorInput
              label="Launcher icon"
              name="widget_color_toggle_text"
              value={colorToggleText}
              onChange={setColorToggleText}
              defaultValue="#ffffff"
            />
          </div>
        </SectionCard>

        <SectionCard
          icon={ImageIcon}
          eyebrow="Launcher"
          title="Choose the button icon"
        >
          <div className="space-y-4">
            <fieldset>
              <legend className="sr-only">Launcher icon</legend>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {widgetLauncherIcons.map((option) => {
                  const OptionIcon =
                    option === "bot"
                      ? Bot
                      : option === "store"
                        ? Store
                        : option === "logo"
                          ? ImageIcon
                          : MessageSquare;

                  return (
                    <label
                      key={option}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 transition ${
                        launcherIcon === option
                          ? "border-emerald-400/70  text-emerald-100"
                          : "border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-100"
                      }`}
                    >
                      <input
                        type="radio"
                        name="widget_launcher_icon"
                        value={option}
                        checked={launcherIcon === option}
                        onChange={() => setLauncherIcon(option)}
                        className="sr-only"
                      />
                      <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-current/20 bg-black/20">
                        <OptionIcon className="h-5 w-5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-sm font-semibold">
                          {launcherIconLabels[option]}
                        </span>
                        <span className="mt-0.5 block text-xs text-slate-500">
                          {launcherIconHelp[option]}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>

            <div className="space-y-2">
              <label
                htmlFor="widget_launcher_logo_url"
                className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400"
              >
                Logo image URL
              </label>
              <input
                id="widget_launcher_logo_url"
                name="widget_launcher_logo_url"
                type="url"
                inputMode="url"
                maxLength={widgetLimits.launcherLogoUrl}
                placeholder="https://example.com/logo.svg"
                value={launcherLogoUrl}
                onChange={(event) => setLauncherLogoUrl(event.target.value)}
                className={inputClass}
              />
              <p className="text-xs leading-relaxed text-slate-500">
                Used only when Logo URL is selected. Supports normal image URLs,
                including hosted SVG files.
              </p>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={Type}
          eyebrow="Copy"
          title="Customize visible text"
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldInput
              label="Visible name"
              name="widget_brand"
              maxLength={widgetLimits.brand}
              placeholder={widgetDefaults.brand}
              value={brandInput}
              onChange={setBrandInput}
              helper={`Default: "${widgetDefaults.brand}".`}
            />
            <FieldInput
              label="Button text"
              name="widget_label"
              maxLength={widgetLimits.label}
              placeholder={widgetDefaults.label}
              value={labelInput}
              onChange={setLabelInput}
              helper={`Default: "${widgetDefaults.label}".`}
            />
            <div className="sm:col-span-2">
              <FieldInput
                label="Initial message"
                name="widget_greeting"
                maxLength={widgetLimits.greeting}
                placeholder={widgetDefaults.greeting}
                value={greetingInput}
                onChange={setGreetingInput}
                helper={`Default: "${widgetDefaults.greeting}".`}
              />
            </div>
            <div className="sm:col-span-2">
              <FieldInput
                label="Header subtitle"
                name="widget_human_support_text"
                maxLength={widgetLimits.humanSupportText}
                placeholder={widgetDefaults.humanSupportText}
                value={humanSupportTextInput}
                onChange={setHumanSupportTextInput}
                helper={`Default: "${widgetDefaults.humanSupportText}".`}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          icon={SlidersHorizontal}
          eyebrow="Behavior"
          title="Choose where the launcher sits"
        >
          <fieldset>
            <legend className="sr-only">Screen position</legend>
            <div className="grid grid-cols-2 gap-2 rounded-xl border border-slate-800  p-1.5">
              {widgetPositions.map((option) => (
                <label
                  key={option}
                  className={`flex cursor-pointer items-center justify-center rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
                    position === option
                      ? "bg-emerald-400 text-slate-950 shadow-sm shadow-emerald-950/40"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                >
                  <input
                    type="radio"
                    name="widget_position"
                    value={option}
                    checked={position === option}
                    onChange={() => setPosition(option)}
                    className="sr-only"
                  />

                  {option === "right" ? "Right" : "Left"}
                </label>
              ))}
            </div>
          </fieldset>
        </SectionCard>

        <SectionCard
          icon={Maximize2}
          eyebrow="Pro layout"
          title="Control size, spacing, and shape"
        >
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <RangeInput
                label="Widget width"
                name="widget_width"
                value={width}
                onChange={setWidth}
                min={widgetLimits.width.min}
                max={widgetLimits.width.max}
              />
              <RangeInput
                label="Widget height"
                name="widget_height"
                value={height}
                onChange={setHeight}
                min={widgetLimits.height.min}
                max={widgetLimits.height.max}
              />
              <RangeInput
                label="Side offset"
                name="widget_offset_x"
                value={offsetX}
                onChange={setOffsetX}
                min={widgetLimits.offsetX.min}
                max={widgetLimits.offsetX.max}
              />
              <RangeInput
                label="Bottom offset"
                name="widget_offset_y"
                value={offsetY}
                onChange={setOffsetY}
                min={widgetLimits.offsetY.min}
                max={widgetLimits.offsetY.max}
              />
              <RangeInput
                label="Launcher size"
                name="widget_launcher_size"
                value={launcherSize}
                onChange={setLauncherSize}
                min={widgetLimits.launcherSize.min}
                max={widgetLimits.launcherSize.max}
              />
              <RangeInput
                label="Corner radius"
                name="widget_border_radius"
                value={borderRadius}
                onChange={setBorderRadius}
                min={widgetLimits.borderRadius.min}
                max={widgetLimits.borderRadius.max}
              />
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 p-3 text-xs leading-5 text-slate-400">
              <Move className="h-4 w-4 shrink-0 text-emerald-200" aria-hidden="true" />
              Mobile keeps a safe full-width layout automatically while desktop uses these Pro controls.
            </div>
          </div>
        </SectionCard>
      </div>

      <div
        className="min-w-0 space-y-5 rounded-2xl border border-slate-800/70 p-4 shadow-xl shadow-slate-950/40 sm:p-5 lg:sticky lg:top-6 lg:self-start"
      >
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Preview
            </p>
            <p className="text-sm text-slate-300">
              Live mobile preview with your current styling.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold text-slate-300">
            <MonitorSmartphone className="h-3.5 w-3.5" aria-hidden="true" />
            320 x 640
          </span>
        </div>

        <div className="mx-auto w-[320px] max-w-full sm:w-[360px]">
          <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-black p-2 shadow-[0_24px_70px_rgba(0,0,0,.55)]">
            <div className="absolute left-1/2 top-3 z-10 h-5 w-24 -translate-x-1/2 rounded-full border border-white/10 bg-black/70" />

            <iframe
              key={iframeKey}
              title="Widget preview"
              src={previewPageUrl}
              sandbox="allow-scripts allow-same-origin"
              className="block h-[640px] w-full rounded-[22px] border-0 bg-slate-100"
            />
          </div>
        </div>

        <div className="space-y-3 min-w-0 rounded-2xl border border-slate-800 p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <MessageSquare
                className="h-4 w-4 shrink-0 text-emerald-200"
                aria-hidden="true"
              />
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                Install before &lt;/body&gt;
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopySnippet}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-100"
            >
              {copyState === "copied" ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              {copyState === "copied" ? "Copied" : "Copy"}
            </button>
          </div>

          <code className="block max-h-36 overflow-auto rounded-xl border border-slate-800 p-3 font-mono text-[11px] leading-relaxed text-emerald-200 break-all">
            {embedSnippet}
          </code>

          <p className="text-xs leading-relaxed text-slate-500">
            This snippet is stable. You don&apos;t need to update it when
            changing settings.
          </p>
        </div>
      </div>
    </div>
  );
}
