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
    <div
      className="fixed inset-x-0 bottom-0 z-[9999] p-3 sm:p-4"
      data-oid="jwh2dqr"
    >
      <div
        className="mx-auto max-w-3xl rounded-2xl border border-slate-700/60 bg-slate-950/90 p-4 shadow-xl backdrop-blur"
        data-oid="aqx9vu8"
      >
        {mode === "banner" ? (
          <div
            className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"
            data-oid="yo2qguf"
          >
            <div className="space-y-1" data-oid="9c0tdvy">
              <p
                className="text-sm font-semibold text-slate-100"
                data-oid="7a3psud"
              >
                Usamos cookies 🍪
              </p>
              <p className="text-sm text-slate-300" data-oid="9.og79m">
                Utilizamos cookies necesarias para que la web funcione y, si lo
                autorizas, cookies de analítica y marketing para mejorar la
                experiencia.
              </p>
              <button
                onClick={() => setMode("settings")}
                className="text-sm text-slate-200 underline decoration-slate-500 underline-offset-4 hover:text-white"
                data-oid="gz3s3zg"
              >
                Configurar cookies
              </button>
            </div>

            <div
              className="flex gap-2 sm:flex-col sm:items-stretch"
              data-oid="tqna3eu"
            >
              <button
                onClick={rejectAll}
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
                data-oid="dzkgqq1"
              >
                Rechazar
              </button>
              <button
                onClick={acceptAll}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110"
                data-oid="sl5auj3"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4" data-oid="r6k7e-o">
            <div
              className="flex items-start justify-between gap-4"
              data-oid="10a6h66"
            >
              <div data-oid="d-:5uxs">
                <p
                  className="text-sm font-semibold text-slate-100"
                  data-oid="ylq.9zc"
                >
                  Preferencias de cookies
                </p>
                <p className="text-sm text-slate-300" data-oid="r3ge.nz">
                  Puedes cambiar estas opciones cuando quieras.
                </p>
              </div>
              <button
                onClick={() => setMode("banner")}
                className="rounded-lg border border-slate-700 px-3 py-1 text-sm text-slate-200 hover:bg-slate-900"
                data-oid="io99_xi"
              >
                Volver
              </button>
            </div>

            <div className="space-y-3" data-oid="r_vf_ks">
              <Row
                title="Necesarias"
                desc="Imprescindibles para que el sitio funcione."
                checked={true}
                disabled
                onChange={() => {}}
                data-oid="003rold"
              />

              <Row
                title="Analítica"
                desc="Para medir uso y mejorar la experiencia (ej: GA)."
                checked={consent.analytics}
                onChange={(v) => setConsent((c) => ({ ...c, analytics: v }))}
                data-oid="90x5i:g"
              />

              <Row
                title="Marketing"
                desc="Para personalizar anuncios y remarketing."
                checked={consent.marketing}
                onChange={(v) => setConsent((c) => ({ ...c, marketing: v }))}
                data-oid="t6q8lp8"
              />
            </div>

            <div
              className="flex flex-col gap-2 sm:flex-row sm:justify-end"
              data-oid="wbnrxyr"
            >
              <button
                onClick={rejectAll}
                className="rounded-xl border border-slate-700 bg-transparent px-4 py-2 text-sm font-medium text-slate-200 hover:bg-slate-900"
                data-oid="hyjl6cq"
              >
                Rechazar todo
              </button>
              <button
                disabled={!canSave}
                onClick={() => save(consent)}
                className="rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:brightness-110 disabled:opacity-60"
                data-oid="ncukz48"
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
    <div
      className="flex items-start justify-between gap-4 rounded-xl border border-slate-800 bg-slate-950/40 p-3 z-99"
      data-oid="0:l_dvv"
    >
      <div data-oid="m8.d:0d">
        <p className="text-sm font-medium text-slate-100" data-oid="o-nkekh">
          {title}
        </p>
        <p className="text-sm text-slate-300" data-oid="o2dud69">
          {desc}
        </p>
      </div>

      <label
        className="relative inline-flex cursor-pointer items-center"
        data-oid="ha8_m3g"
      >
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          data-oid="rgktd8j"
        />

        <div
          className={[
            "h-6 w-11 rounded-full border border-slate-700 bg-slate-900 transition",
            "peer-checked:bg-emerald-500",
            "peer-disabled:opacity-60 peer-disabled:cursor-not-allowed",
          ].join(" ")}
          data-oid="3lsk_1."
        />

        <div
          className={[
            "absolute left-1 top-1 h-4 w-4 rounded-full bg-slate-200 transition",
            "peer-checked:translate-x-5",
          ].join(" ")}
          data-oid="qea60m-"
        />
      </label>
    </div>
  );
}
