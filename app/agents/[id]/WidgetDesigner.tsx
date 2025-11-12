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
}: WidgetDesignerProps) {
  const [accentInput, setAccentInput] = useState(initialAccent ?? "");
  const [brandInput, setBrandInput] = useState(initialBrand ?? "");
  const [labelInput, setLabelInput] = useState(initialLabel ?? "");
  const [greetingInput, setGreetingInput] = useState(initialGreeting ?? "");
  const [position, setPosition] = useState<WidgetPosition>(
    initialPosition ?? widgetDefaults.position,
  );

  const iframeRef = useRef<HTMLIFrameElement | null>(null);

  const accentPickerValue =
    normalizeHex(accentInput) ?? widgetDefaults.accent;
  const accentError =
    accentInput && !normalizeHex(accentInput)
      ? "Usa un hex de 3 o 6 caracteres."
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

    return `${siteUrl}/api/widget?${params.toString()}`;
  }, [
    accentInput,
    apiKey,
    brandInput,
    greetingInput,
    labelInput,
    position,
    siteUrl,
  ]);

  useEffect(() => {
    if (!apiKey) return;
    const frame = iframeRef.current;
    if (!frame) return;
    const doc = frame.contentDocument;
    if (!doc) return;

    doc.open();
    doc.write(`<!doctype html>
<html lang="es">
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
    <span class="preview-hint">Vista previa</span>
  </body>
</html>`);
    doc.close();

    const loader = doc.createElement("div");
    loader.textContent = "Cargando widget...";
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
    script.onload = () => loader.remove();
    script.onerror = () => {
      loader.textContent = "No pudimos cargar la vista previa.";
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
  }

  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(280px,1fr)_minmax(260px,1fr)]">
      <form
        action={formAction}
        className="space-y-5 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40"
      >
        <input type="hidden" name="agent_id" value={agentId} />

        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <label
              htmlFor="widget-accent"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
            >
              Color de acento
            </label>
            <input
              type="color"
              aria-label="Selector de color"
              className="h-9 w-9 cursor-pointer rounded-lg border border-slate-700 bg-slate-900 p-0"
              value={accentPickerValue}
              onChange={(event) => setAccentInput(event.target.value)}
            />
            <button
              type="button"
              className="text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300 transition hover:text-emerald-200"
              onClick={() => setAccentInput("")}
            >
              Restablecer
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
            Acepta formatos #RRGGBB o RRGGBB. Vacío = color predeterminado (
            {widgetDefaults.accent}).
          </p>
          {accentError && (
            <p className="text-xs text-rose-300">{accentError}</p>
          )}
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-brand"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Nombre visible
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
            Máximo {widgetLimits.brand} caracteres. Vacío = “
            {widgetDefaults.brand}”.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-label"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Texto del botón
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
            Máximo {widgetLimits.label} caracteres. Vacío = “
            {widgetDefaults.label}”.
          </p>
        </div>

        <div className="space-y-2">
          <label
            htmlFor="widget-greeting"
            className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400"
          >
            Mensaje inicial
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
            Máximo {widgetLimits.greeting} caracteres. Vacío = “
            {widgetDefaults.greeting}”.
          </p>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Posición en pantalla
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
                {option === "right" ? "Derecha" : "Izquierda"}
              </label>
            ))}
          </div>
        </fieldset>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            className="inline-flex flex-1 items-center justify-center rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 sm:flex-none"
          >
            Guardar personalización
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-slate-700 px-5 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200 sm:flex-none"
          >
            Valores predeterminados
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Los valores vacíos usan automáticamente los mismos textos y colores
          que ve el widget por defecto.
        </p>
      </form>

      <div className="space-y-4 rounded-2xl border border-slate-800/70 bg-slate-950/60 p-5 shadow-inner shadow-slate-950/40">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            Vista previa en vivo
          </p>
          <p className="text-sm text-slate-300">
            Usamos el script real contra{" "}
            <code className="rounded bg-slate-900 px-2 py-0.5 text-xs text-emerald-200">
              /api/widget
            </code>
            .
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/80">
          <iframe
            ref={iframeRef}
            title="Widget preview"
            className="h-96 w-full rounded-xl border-0 bg-slate-950"
          />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
            URL generada
          </p>
          <code className="block max-h-24 overflow-auto rounded-lg bg-slate-950/80 p-3 text-[11px] text-emerald-200">
            {previewUrl}
          </code>
        </div>
      </div>
    </div>
  );
}
