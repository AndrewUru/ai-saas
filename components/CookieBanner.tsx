"use client";

import { Cookie, Settings2, ShieldCheck, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ConsentState,
  defaultConsent,
  emitConsentUpdated,
  getConsentFromBrowser,
  setConsentInBrowser,
} from "@/lib/cookies/consent";

type Mode = "banner" | "settings" | "hidden";

const bannerOffset =
  "bottom-[calc(88px+env(safe-area-inset-bottom,0px))] sm:bottom-5";

export default function CookieBanner() {
  const [mode, setMode] = useState<Mode>("hidden");
  const [consent, setConsent] = useState<ConsentState>(defaultConsent);

  useEffect(() => {
    const stored = getConsentFromBrowser();
    if (stored) {
      setConsent(stored);
      return;
    }

    setMode("banner");
  }, []);

  function save(next: ConsentState) {
    const normalized: ConsentState = {
      necessary: true,
      analytics: next.analytics,
      marketing: next.marketing,
      updatedAt: Date.now(),
    };

    setConsent(normalized);
    setConsentInBrowser(normalized);
    emitConsentUpdated(normalized);
    setMode("hidden");
  }

  function acceptAll() {
    save({
      necessary: true,
      analytics: true,
      marketing: true,
      updatedAt: Date.now(),
    });
  }

  function rejectAll() {
    save({
      necessary: true,
      analytics: false,
      marketing: false,
      updatedAt: Date.now(),
    });
  }

  if (mode === "hidden") return null;

  return (
    <aside
      aria-label="Cookie consent"
      className={`fixed left-3 right-3 ${bannerOffset} z-[70] sm:left-5 sm:right-auto sm:w-[min(430px,calc(100vw-40px))]`}
    >
      <div className="ui-card ui-card--strong overflow-hidden border-accent/20 bg-background/90 shadow-[0_22px_60px_rgba(0,0,0,0.45)]">
        {mode === "banner" ? (
          <div className="p-4 sm:p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-accent">
                <Cookie className="h-5 w-5" aria-hidden="true" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Cookies y privacidad
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                      Usamos cookies necesarias para que la app funcione. Con tu
                      permiso, tambien usamos analitica y marketing para mejorar
                      la experiencia.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={rejectAll}
                    className="ui-button ui-button--subtle -mr-2 -mt-2 h-9 w-9 shrink-0 p-0"
                    aria-label="Cerrar y usar solo cookies necesarias"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>

                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    onClick={acceptAll}
                    className="ui-button ui-button--primary h-10 flex-1 px-4 text-sm"
                  >
                    Aceptar todo
                  </button>
                  <button
                    type="button"
                    onClick={() => setMode("settings")}
                    className="ui-button ui-button--secondary h-10 flex-1 px-4 text-sm"
                  >
                    <Settings2 className="h-4 w-4" aria-hidden="true" />
                    Configurar
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[var(--foreground-muted)]">
                  <button
                    type="button"
                    onClick={rejectAll}
                    className="font-medium underline decoration-border underline-offset-4 transition hover:text-foreground"
                  >
                    Solo necesarias
                  </button>
                  <Link
                    href="/privacy"
                    className="font-medium underline decoration-border underline-offset-4 transition hover:text-foreground"
                  >
                    Politica de privacidad
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-accent/25 bg-accent/10 text-accent">
                  <ShieldCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    Preferencias de cookies
                  </p>
                  <p className="mt-1 text-xs leading-5 text-[var(--foreground-muted)]">
                    Puedes activar solo las categorias que quieras.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMode("banner")}
                className="ui-button ui-button--subtle -mr-2 -mt-2 h-9 w-9 shrink-0 p-0"
                aria-label="Volver al resumen de cookies"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-4 space-y-2">
              <CookieRow
                title="Necesarias"
                desc="Imprescindibles para sesion, seguridad y preferencias basicas."
                checked
                disabled
                onChange={() => {}}
              />
              <CookieRow
                title="Analitica"
                desc="Nos ayuda a medir uso y detectar friccion en la experiencia."
                checked={consent.analytics}
                onChange={(analytics) =>
                  setConsent((current) => ({ ...current, analytics }))
                }
              />
              <CookieRow
                title="Marketing"
                desc="Permite personalizar campanas y medir conversiones."
                checked={consent.marketing}
                onChange={(marketing) =>
                  setConsent((current) => ({ ...current, marketing }))
                }
              />
            </div>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={rejectAll}
                className="ui-button ui-button--secondary h-10 flex-1 px-4 text-sm"
              >
                Rechazar todo
              </button>
              <button
                type="button"
                onClick={() => save(consent)}
                className="ui-button ui-button--primary h-10 flex-1 px-4 text-sm"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

function CookieRow({
  title,
  desc,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-border bg-surface/40 p-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-xs leading-5 text-[var(--foreground-muted)]">
          {desc}
        </p>
      </div>

      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
        />
        <span className="h-6 w-11 rounded-full border border-border bg-background transition peer-checked:border-accent/40 peer-checked:bg-accent peer-disabled:cursor-not-allowed peer-disabled:opacity-60" />
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-foreground transition peer-checked:translate-x-5 peer-checked:bg-background" />
      </label>
    </div>
  );
}
