"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ConsentState,
  defaultConsent,
  emitConsentUpdated,
  getConsentFromBrowser,
  setConsentInBrowser,
} from "@/lib/cookies/consent";

type Mode = "banner" | "settings" | "hidden";

export default function CookieBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);

  // Detecta si ya hay consentimiento guardado
  useEffect(() => {
    const stored = getConsentFromBrowser();
    if (stored) {
      setConsent(stored);
      setMode("hidden");
      return;
    }
    setMode("banner");
  }, []);

  const canSave = useMemo(() => true, []);

  function save(next: ConsentState) {
    const normalized: ConsentState = {
      necessary: true,
      analytics: !!next.analytics,
      marketing: !!next.marketing,
      updatedAt: Date.now(),
    };

    setConsent(normalized);
    setConsentInBrowser(normalized);
    emitConsentUpdated(normalized);
    setMode("hidden");
  }

  function acceptAll() {
    save({
      ...consent,
      analytics: true,
      marketing: true,
      updatedAt: Date.now(),
    });
  }

  function rejectAll() {
    save({
      ...consent,
      analytics: false,
      marketing: false,
      updatedAt: Date.now(),
    });
  }

  if (mode === "hidden") return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4">
      <div className="mx-auto max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 shadow-xl backdrop-blur">
        {mode === "banner" ? (
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-100">
                Usamos cookies 🍪
              </p>
              <p className="text-sm text-slate-300">
                Utilizamos cookies necesarias para que la web funcione y, si lo
                autorizas, cookies de analítica y marketing para mejorar la
                experiencia.
              </p>
              <button
                onClick={() => setMode("settings")}
                className="text-sm text-slate-200 underline decoration-slate-500 underline-offset-4 hover:text-white"
              >
                Configurar cookies
              </button>
            </div>

            <div className="flex gap-2 sm:flex-col sm:items-stretch">
              <button
                onClick={rejectAll}
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Rechazar
              </button>
              <button
                onClick={acceptAll}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Preferencias de cookies
                </p>
                <p className="text-sm text-slate-300">
                  Puedes cambiar estas opciones cuando quieras.
                </p>
              </div>
              <button
                onClick={() => setMode("banner")}
                className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-900"
              >
                Volver
              </button>
            </div>

            <div className="space-y-3">
              <Row
                title="Necesarias"
                desc="Imprescindibles para que el sitio funcione."
                checked={true}
                disabled
                onChange={() => {}}
              />
              <Row
                title="Analítica"
                desc="Para medir uso y mejorar la experiencia (ej: GA)."
                checked={consent.analytics}
                onChange={(v) => setConsent((c) => ({ ...c, analytics: v }))}
              />
              <Row
                title="Marketing"
                desc="Para personalizar anuncios y remarketing."
                checked={consent.marketing}
                onChange={(v) => setConsent((c) => ({ ...c, marketing: v }))}
              />
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={rejectAll}
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
              >
                Rechazar todo
              </button>
              <button
                disabled={!canSave}
                onClick={() => save(consent)}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 disabled:opacity-60"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({
  title,
  desc,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3">
      <div>
        <p className="text-sm font-medium text-slate-100">{title}</p>
        <p className="text-sm text-slate-300">{desc}</p>
      </div>

      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div
          className={[
            "h-6 w-11 rounded-full border border-slate-700 bg-slate-900 transition",
            "peer-checked:bg-emerald-500",
            "peer-disabled:opacity-60 peer-disabled:cursor-not-allowed",
          ].join(" ")}
        />
        <div
          className={[
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-200 transition",
            "peer-checked:translate-x-5",
          ].join(" ")}
        />
      </label>
    </div>
  );
}
