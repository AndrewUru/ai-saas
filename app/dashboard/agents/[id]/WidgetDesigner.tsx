//C:\ai-saas\app\dashboard\agents\[id]\WidgetDesigner.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  widgetDefaults,
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

  initialHumanSupportText: string | null;
  initialPosition: WidgetPosition | null;
  // New props
  initialColorHeaderBg: string | null;
  initialColorHeaderText: string | null;
  initialColorChatBg: string | null;
  initialColorUserBubbleBg: string | null;
  initialColorUserBubbleText: string | null;
  initialColorBotBubbleBg: string | null;
  initialColorBotBubbleText: string | null;
  initialColorToggleBg: string | null;
  initialColorToggleText: string | null;
};

// Start Helper Component for Color Input
function ColorInput({
  label,
  name,
  value,
  onChange,
  defaultValue,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (val: string) => void;
  defaultValue: string;
}) {
  const pickerValue = normalizeHex(value) ?? defaultValue;
  return (
    <div className="space-y-1">
      <label className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <input
          type="color"
          className="h-9 w-9 cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-0"
          value={pickerValue}
          onChange={(e) => onChange(e.target.value)}
        />

        <input
          name={name}
          placeholder={defaultValue}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-w-0 rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-2 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
        />

        <button
          type="button"
          onClick={() => onChange("")}
          className="text-xs uppercase text-slate-500 hover:text-emerald-300"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
// End Helper Component

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

export default function WidgetDesigner({
  apiKey,
  siteUrl,
  initialAccent,
  initialBrand,
  initialLabel,

  initialGreeting,
  initialHumanSupportText,
  initialPosition,
  initialColorHeaderBg,
  initialColorHeaderText,
  initialColorChatBg,
  initialColorUserBubbleBg,
  initialColorUserBubbleText,
  initialColorBotBubbleBg,
  initialColorBotBubbleText,
  initialColorToggleBg,
  initialColorToggleText,
}: WidgetDesignerProps) {
  const [accentInput, setAccentInput] = useState(initialAccent ?? "");
  const [brandInput, setBrandInput] = useState(initialBrand ?? "");
  const [labelInput, setLabelInput] = useState(initialLabel ?? "");
  const [greetingInput, setGreetingInput] = useState(initialGreeting ?? "");
  const [humanSupportTextInput, setHumanSupportTextInput] = useState(
    initialHumanSupportText ?? ""
  );
  const [position, setPosition] = useState<WidgetPosition>(
    initialPosition ?? widgetDefaults.position
  );

  // New States
  const [colorHeaderBg, setColorHeaderBg] = useState(
    initialColorHeaderBg ?? ""
  );
  const [colorHeaderText, setColorHeaderText] = useState(
    initialColorHeaderText ?? ""
  );
  const [colorChatBg, setColorChatBg] = useState(initialColorChatBg ?? "");
  const [colorUserBubbleBg, setColorUserBubbleBg] = useState(
    initialColorUserBubbleBg ?? ""
  );
  const [colorUserBubbleText, setColorUserBubbleText] = useState(
    initialColorUserBubbleText ?? ""
  );
  const [colorBotBubbleBg, setColorBotBubbleBg] = useState(
    initialColorBotBubbleBg ?? ""
  );
  const [colorBotBubbleText, setColorBotBubbleText] = useState(
    initialColorBotBubbleText ?? ""
  );
  const [colorToggleBg, setColorToggleBg] = useState(
    initialColorToggleBg ?? ""
  );
  const [colorToggleText, setColorToggleText] = useState(
    initialColorToggleText ?? ""
  );

  const embedSnippet = getEmbedSnippet(apiKey);

  const accentPickerValue = normalizeHex(accentInput) ?? widgetDefaults.accent;
  const accentError =
    accentInput && !normalizeHex(accentInput)
      ? "Use a 3- or 6-character hex value."
      : null;

  const liveStateInput = useMemo(
    () => ({
      apiKey,
      siteUrl,
      accentInput,
      brandInput,
      labelInput,
      greetingInput,
      humanSupportTextInput,
      position,
      colorHeaderBg,
      colorHeaderText,
      colorChatBg,
      colorUserBubbleBg,
      colorUserBubbleText,
      colorBotBubbleBg,
      colorBotBubbleText,
      colorToggleBg,
      colorToggleText,
    }),
    [
      apiKey,
      siteUrl,
      accentInput,
      brandInput,
      labelInput,
      greetingInput,
      humanSupportTextInput,
      position,
      colorHeaderBg,
      colorHeaderText,
      colorChatBg,
      colorUserBubbleBg,
      colorUserBubbleText,
      colorBotBubbleBg,
      colorBotBubbleText,
      colorToggleBg,
      colorToggleText,
    ]
  );

  const liveState = useDebouncedValue(liveStateInput, 300);

  const previewPageUrl = useMemo(() => {
    const params = new URLSearchParams();
    params.set("key", liveState.apiKey);
    params.set("preview", "1");
    params.set("accent", toParamHex(liveState.accentInput) ?? "");
    params.set(
      "brandName",
      trimmedOrNull(liveState.brandInput, widgetLimits.brand) ?? ""
    );
    params.set(
      "collapsedLabel",
      trimmedOrNull(liveState.labelInput, widgetLimits.label) ?? ""
    );
    params.set(
      "greeting",
      trimmedOrNull(liveState.greetingInput, widgetLimits.greeting) ?? ""
    );
    params.set(
      "humanSupportText",
      trimmedOrNull(
        liveState.humanSupportTextInput,
        widgetLimits.humanSupportText
      ) ?? ""
    );
    params.set("position", liveState.position);

    params.set("colorHeaderBg", toParamHex(liveState.colorHeaderBg) ?? "");
    params.set("colorHeaderText", toParamHex(liveState.colorHeaderText) ?? "");
    params.set("colorChatBg", toParamHex(liveState.colorChatBg) ?? "");
    params.set(
      "colorUserBubbleBg",
      toParamHex(liveState.colorUserBubbleBg) ?? ""
    );
    params.set(
      "colorUserBubbleText",
      toParamHex(liveState.colorUserBubbleText) ?? ""
    );
    params.set(
      "colorBotBubbleBg",
      toParamHex(liveState.colorBotBubbleBg) ?? ""
    );
    params.set(
      "colorBotBubbleText",
      toParamHex(liveState.colorBotBubbleText) ?? ""
    );
    params.set("colorToggleBg", toParamHex(liveState.colorToggleBg) ?? "");
    params.set("colorToggleText", toParamHex(liveState.colorToggleText) ?? "");

    return `${liveState.siteUrl}/widget/preview?${params.toString()}`;
  }, [liveState]);

  function handleReset() {
    setAccentInput("");
    setBrandInput("");
    setLabelInput("");
    setGreetingInput("");
    setHumanSupportTextInput("");
    setPosition(widgetDefaults.position);
    setColorHeaderBg("");
    setColorHeaderText("");
    setColorChatBg("");
    setColorUserBubbleBg("");
    setColorUserBubbleText("");
    setColorBotBubbleBg("");
    setColorBotBubbleText("");
    setColorToggleBg("");
    setColorToggleText("");
  }

  return (
    <div
      className="
        mt-8 grid gap-8
        lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,1fr)]
        xl:grid-cols-[minmax(0,1.25fr)_minmax(360px,1fr)]
        2xl:grid-cols-[minmax(0,1.35fr)_minmax(420px,1fr)]
        w-full min-w-0
      "
    >
      <div className="space-y-4 p-3 shadow-xl shadow-slate-950/40">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Branding & UX
            </p>
            <h3 className="text-lg font-semibold text-white">
              Adjust appearance and visible texts
            </h3>
          </div>
          <button
            type="button"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300 transition hover:text-emerald-200"
            onClick={handleReset}
          >
            Clear fields
          </button>
        </div>

        <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="widget-accent"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
            >
              Main Accent Color
            </label>
            <input
              type="color"
              aria-label="Color picker"
              className="h-9 w-9 cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-0"
              value={accentPickerValue}
              onChange={(event) => setAccentInput(event.target.value)}
            />

            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300 transition hover:text-emerald-200"
              onClick={() => setAccentInput("")}
            >
              Reset
            </button>
          </div>
          <input
            id="widget-accent"
            name="widget_accent"
            placeholder={widgetDefaults.accent}
            value={accentInput}
            onChange={(event) => setAccentInput(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />

          <p className="text-xs text-slate-500">
            Accepts #RRGGBB or RRGGBB formats. Empty = default color (
            {widgetDefaults.accent}).
          </p>
          {accentError && (
            <p className="text-xs text-rose-300">{accentError}</p>
          )}
        </div>

        {/* Detailed Color Customization */}
        <div className="space-y-4 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-200">
            Advanced Colors
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <ColorInput
              label="Header BG"
              name="widget_color_header_bg"
              value={colorHeaderBg}
              onChange={setColorHeaderBg}
              defaultValue="#008069"
            />
            <ColorInput
              label="Header Text"
              name="widget_color_header_text"
              value={colorHeaderText}
              onChange={setColorHeaderText}
              defaultValue="#ffffff"
            />
            <ColorInput
              label="Chat Background"
              name="widget_color_chat_bg"
              value={colorChatBg}
              onChange={setColorChatBg}
              defaultValue="#efe7dd"
            />
            <div /> {/* Spacer */}
            <ColorInput
              label="User Bubble BG"
              name="widget_color_user_bubble_bg"
              value={colorUserBubbleBg}
              onChange={setColorUserBubbleBg}
              defaultValue="#d9fdd3"
            />
            <ColorInput
              label="User Bubble Text"
              name="widget_color_user_bubble_text"
              value={colorUserBubbleText}
              onChange={setColorUserBubbleText}
              defaultValue="#111b21"
            />
            <ColorInput
              label="Bot Bubble BG"
              name="widget_color_bot_bubble_bg"
              value={colorBotBubbleBg}
              onChange={setColorBotBubbleBg}
              defaultValue="#ffffff"
            />
            <ColorInput
              label="Bot Bubble Text"
              name="widget_color_bot_bubble_text"
              value={colorBotBubbleText}
              onChange={setColorBotBubbleText}
              defaultValue="#111b21"
            />
            <div /> {/* Spacer */}
            <ColorInput
              label="Toggle Button BG"
              name="widget_color_toggle_bg"
              value={colorToggleBg}
              onChange={setColorToggleBg}
              defaultValue="#25D366"
            />
            <ColorInput
              label="Toggle Button Icon"
              name="widget_color_toggle_text"
              value={colorToggleText}
              onChange={setColorToggleText}
              defaultValue="#ffffff"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-brand"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Visible name
          </label>
          <input
            id="widget-brand"
            name="widget_brand"
            maxLength={widgetLimits.brand}
            placeholder={widgetDefaults.brand}
            value={brandInput}
            onChange={(event) => setBrandInput(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />

          <p className="text-xs text-slate-500">
            Max {widgetLimits.brand} characters. Empty = uses &quot;
            {widgetDefaults.brand}&quot;.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-label"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Button text
          </label>
          <input
            id="widget-label"
            name="widget_label"
            maxLength={widgetLimits.label}
            placeholder={widgetDefaults.label}
            value={labelInput}
            onChange={(event) => setLabelInput(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />

          <p className="text-xs text-slate-500">
            Max {widgetLimits.label} characters. Empty = uses &quot;
            {widgetDefaults.label}&quot;.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-greeting"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Initial message
          </label>
          <input
            id="widget-greeting"
            name="widget_greeting"
            maxLength={widgetLimits.greeting}
            placeholder={widgetDefaults.greeting}
            value={greetingInput}
            onChange={(event) => setGreetingInput(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />

          <p className="text-xs text-slate-500">
            Max {widgetLimits.greeting} characters. Empty = uses &quot;
            {widgetDefaults.greeting}&quot;.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-human-support"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Header subtitle
          </label>
          <input
            id="widget-human-support"
            name="widget_human_support_text"
            maxLength={widgetLimits.humanSupportText}
            placeholder={widgetDefaults.humanSupportText}
            value={humanSupportTextInput}
            onChange={(event) => setHumanSupportTextInput(event.target.value)}
            className="w-full rounded-xl border border-slate-800 bg-slate-950/70 px-4 py-3 text-sm text-white placeholder:text-slate-500 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40"
          />

          <p className="text-xs text-slate-500">
            Max {widgetLimits.humanSupportText} characters. Empty = uses &quot;
            {widgetDefaults.humanSupportText}&quot;.
          </p>
        </div>

        <fieldset className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
          <legend className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Screen position
          </legend>
          <div className="flex flex-wrap gap-3">
            {widgetPositions.map((option) => (
              <label
                key={option}
                className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] ${
                  position === option
                    ? "border-emerald-400 text-emerald-200"
                    : "border-slate-700 text-slate-300"
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

        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 sm:flex-none"
          >
            Default values
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Empty values automatically use the widget&apos;s default texts and
          colors.
        </p>
      </div>

      <div className="space-y-5 rounded-3xl border border-slate-800/70 bg-linear-to-br from-slate-950/75 via-slate-950/60 to-slate-900/60 p-6 shadow-xl shadow-slate-950/40">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Preview
            </p>
            <p className="text-sm text-slate-300">
              Updates automatically as you edit.
            </p>
          </div>
        </div>
        {/* Preview canvas */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4">
          <div className="mx-auto w-[320px] max-w-full">
            {/* Device frame */}
            <div className="relative overflow-hidden rounded-[34px] border border-white/10 bg-black shadow-[0_24px_70px_rgba(0,0,0,.55)]">
              {/* Notch */}
              <div className="absolute left-1/2 top-2 z-10 h-6 w-28 -translate-x-1/2 rounded-full bg-black/70 border border-white/10" />

              {/* Screen */}
              <iframe
                title="Widget preview"
                src={previewPageUrl}
                sandbox="allow-scripts allow-same-origin"
                className="block h-[640px] w-full border-0"
              />
            </div>

            {/* Helper line */}
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
              <span>Mobile preview</span>
              <span className="text-slate-500">320 × 640</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Installation Code - Place before &lt;/body&gt;
          </p>
          <div className="relative group">
            <code className="block rounded-xl border border-slate-800 bg-slate-950/80 p-4 text-[11px] text-emerald-200 overflow-x-auto break-all font-mono">
              {embedSnippet}
            </code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(embedSnippet);
                // Could show toast here
              }}
              className="absolute top-2 right-2 rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 opacity-0 transition group-hover:opacity-100 hover:border-emerald-500 hover:text-emerald-400"
            >
              Copy
            </button>
          </div>
          <p className="text-xs text-slate-500">
            This snippet is stable. You don&apos;t need to update it when
            changing settings.
          </p>
        </div>
      </div>
    </div>
  );
}
