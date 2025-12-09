"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  widgetDefaults,
  widgetLimits,
  widgetPositions,
  WidgetPosition,
} from "@/lib/widget/defaults";

type WidgetDesignerProps = {
  formAction: (formData: FormData) => void;
  agentId: string;
  apiKey: string;
  siteUrl: string;
  initialAccent: string | null;
  initialBrand: string | null;
  initialLabel: string | null;
  initialGreeting: string | null;
  initialPosition: WidgetPosition | null;
  // New props
  initialColorHeaderBg: string | null;
  initialColorHeaderText: string | null;
  initialColorChatBg: string | null;
  initialColorUserBubbleBg: string | null;
  initialColorUserBubbleText: string | null;
  initialColorBotBubbleBg: string | null;
  initialColorBotBubbleText: string | null;
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
  formAction,
  agentId,
  apiKey,
  siteUrl,
  initialAccent,
  initialBrand,
  initialLabel,
  initialGreeting,
  initialPosition,
  initialColorHeaderBg,
  initialColorHeaderText,
  initialColorChatBg,
  initialColorUserBubbleBg,
  initialColorUserBubbleText,
  initialColorBotBubbleBg,
  initialColorBotBubbleText,
}: WidgetDesignerProps) {
  const [accentInput, setAccentInput] = useState(initialAccent ?? "");
  const [brandInput, setBrandInput] = useState(initialBrand ?? "");
  const [labelInput, setLabelInput] = useState(initialLabel ?? "");
  const [greetingInput, setGreetingInput] = useState(initialGreeting ?? "");
  const [position, setPosition] = useState<WidgetPosition>(
    initialPosition ?? widgetDefaults.position
  );

  // New States
  const [colorHeaderBg, setColorHeaderBg] = useState(initialColorHeaderBg ?? "");
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

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const accentPickerValue = normalizeHex(accentInput) ?? widgetDefaults.accent;
  const accentError =
    accentInput && !normalizeHex(accentInput)
      ? "Use a 3- or 6-character hex value."
      : null;

  const previewUrl = useMemo(() => {
    const params = new URLSearchParams({ key: apiKey });

    const normalizedAccent = toParamHex(accentInput);
    if (normalizedAccent) params.set("accent", normalizedAccent);

    const brand = trimmedOrNull(brandInput, widgetLimits.brand);
    if (brand) params.set("brand", brand);

    const label = trimmedOrNull(labelInput, widgetLimits.label);
    if (label) params.set("label", label);

    const greeting = trimmedOrNull(greetingInput, widgetLimits.greeting);
    if (greeting) params.set("greeting", greeting);

    if (position !== widgetDefaults.position) {
      params.set("position", position);
    }

    // New Params
    if (toParamHex(colorHeaderBg))
      params.set("colorHeaderBg", toParamHex(colorHeaderBg)!);
    if (toParamHex(colorHeaderText))
      params.set("colorHeaderText", toParamHex(colorHeaderText)!);
    if (toParamHex(colorChatBg))
      params.set("colorChatBg", toParamHex(colorChatBg)!);
    if (toParamHex(colorUserBubbleBg))
      params.set("colorUserBubbleBg", toParamHex(colorUserBubbleBg)!);
    if (toParamHex(colorUserBubbleText))
      params.set("colorUserBubbleText", toParamHex(colorUserBubbleText)!);
    if (toParamHex(colorBotBubbleBg))
      params.set("colorBotBubbleBg", toParamHex(colorBotBubbleBg)!);
    if (toParamHex(colorBotBubbleText))
      params.set("colorBotBubbleText", toParamHex(colorBotBubbleText)!);

    params.set("preview", "1");

    return `${siteUrl}/api/widget?${params.toString()}`;
  }, [
    accentInput,
    apiKey,
    brandInput,
    greetingInput,
    labelInput,
    position,
    siteUrl,
    colorHeaderBg,
    colorHeaderText,
    colorChatBg,
    colorUserBubbleBg,
    colorUserBubbleText,
    colorBotBubbleBg,
    colorBotBubbleText,
  ]);

  useEffect(() => {
    if (!apiKey) return;
    const frame = iframeRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        background: #020617;
        color: #e2e8f0;
        font-family: "Inter", "Helvetica Neue", Arial, sans-serif;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .preview-hint {
        position: absolute;
        top: 18px;
        left: 18px;
        font-size: 12px;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        color: rgba(226, 232, 240, 0.7);
      }
    </style>
  </head>
  <body>
    <span class="preview-hint">Preview</span>
  </body>
</html>`);
    doc.close();

    const loader = doc.createElement("div");
    loader.textContent = "Loading widget...";
    loader.style.position = "absolute";
    loader.style.bottom = "18px";
    loader.style.left = "50%";
    loader.style.transform = "translateX(-50%)";
    loader.style.fontSize = "13px";
    loader.style.letterSpacing = "0.05em";
    loader.style.color = "rgba(226,232,240,0.7)";
    doc.body.appendChild(loader);

    const script = doc.createElement("script");
    script.src = previewUrl;
    script.defer = true;
    script.referrerPolicy = "strict-origin-when-cross-origin";
    script.onload = () => loader.remove();
    script.onerror = () => {
      loader.textContent = "We couldn't load the preview.";
    };

    doc.body.appendChild(script);

    return () => {
      doc.body.innerHTML = "";
    };
  }, [apiKey, previewUrl]);

  function handleReset() {
    setAccentInput("");
    setBrandInput("");
    setLabelInput("");
    setGreetingInput("");
    setPosition(widgetDefaults.position);
    setColorHeaderBg("");
    setColorHeaderText("");
    setColorChatBg("");
    setColorUserBubbleBg("");
    setColorUserBubbleText("");
    setColorBotBubbleBg("");
    setColorBotBubbleText("");
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
      <form
        action={formAction}
        className="space-y-6 rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-950/75 via-slate-950/65 to-slate-900/60 p-6 shadow-xl shadow-slate-950/40"
      >
        <input type="hidden" name="agent_id" value={agentId} />

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
          {accentError && <p className="text-xs text-rose-300">{accentError}</p>}
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
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:flex-none"
          >
            Save customization
          </button>
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
      </form>

      <div className="space-y-5 rounded-3xl border border-slate-800/70 bg-gradient-to-br from-slate-950/75 via-slate-950/60 to-slate-900/60 p-6 shadow-xl shadow-slate-950/40">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-200">
              Live preview
            </p>
            <p className="text-sm text-slate-300">
              We use the real script against{" "}
              <code className="rounded bg-slate-900 px-2 py-0.5 text-xs text-emerald-200">
                /api/widget
              </code>
              .
            </p>
          </div>
          <span className="rounded-full border border-slate-800 px-3 py-1 text-[11px] uppercase tracking-[0.2em] text-slate-400">
            Real time
          </span>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/80">
          <iframe
            ref={iframeRef}
            title="Widget preview"
            className="h-[460px] w-full border-0 bg-slate-950"
          />
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Generated URL
          </p>
          <code className="block max-h-28 overflow-auto rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-[11px] text-emerald-200 overflow-x-auto break-all">
            {previewUrl}
          </code>
        </div>
      </div>
    </div>
  );
}
