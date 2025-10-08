"use client";

import { useEffect, useState } from "react";

type PayPalSubscriptionActions = {
  subscription: {
    create: (options: { plan_id: string }) => Promise<string>;
  };
};

type PayPalButtons = {
  render: (selector: string) => void;
};

type PayPalButtonsConfig = {
  style: { layout: "vertical"; color: "gold"; label: "subscribe" };
  createSubscription: (
    data: Record<string, unknown>,
    actions: PayPalSubscriptionActions,
  ) => Promise<string>;
  onApprove: (data: { subscriptionID: string }) => Promise<void>;
  onError: () => void;
};

type PayPalSDK = {
  Buttons: (config: PayPalButtonsConfig) => PayPalButtons;
};

type SubscriptionConfirmResponse = {
  ok: boolean;
  error?: string;
};

type Status =
  | {
      intent: "info" | "success" | "error";
      message: string;
    }
  | null;

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

export default function BillingPage() {
  const [status, setStatus] = useState<Status>({
    intent: "info",
    message: "Preparando pasarela de pago segura...",
  });
  const [isPayPalReady, setIsPayPalReady] = useState(false);

  useEffect(() => {
    const src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription&currency=EUR`;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onerror = () => {
      setStatus({
        intent: "error",
        message:
          "No pudimos conectar con PayPal. Vuelve a intentarlo o contacta con soporte.",
      });
    };
    script.onload = () => {
      const paypal = window.paypal;

      if (!paypal) {
        console.error("PayPal SDK not available on window");
        setStatus({
          intent: "error",
          message: "No pudimos cargar el SDK de PayPal.",
        });
        return;
      }

      const planId =
        process.env.NEXT_PUBLIC_PAYPAL_PLAN_BASIC ??
        process.env.PAYPAL_PLAN_BASIC;

      if (!planId) {
        console.error("Missing PayPal plan id environment variables");
        setStatus({
          intent: "error",
          message: "Plan de PayPal sin configurar. Contacta con soporte.",
        });
        return;
      }

      try {
        paypal
          .Buttons({
            style: { layout: "vertical", color: "gold", label: "subscribe" },
            createSubscription: (_data, actions) =>
              actions.subscription.create({
                plan_id: planId,
              }),
            onApprove: async (data) => {
              const response = await fetch("/api/paypal/subscription/confirm", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscriptionID: data.subscriptionID,
                  plan: "basic",
                }),
              });
              const result =
                (await response.json()) as SubscriptionConfirmResponse;

              if (result.ok) {
                setStatus({
                  intent: "success",
                  message:
                    "Suscripcion activada con exito. Redirigiendo al panel...",
                });
                setTimeout(() => {
                  window.location.href = "/dashboard";
                }, 1500);
              } else {
                setStatus({
                  intent: "error",
                  message:
                    result.error ?? "No pudimos confirmar la suscripcion.",
                });
              }
            },
            onError: () =>
              setStatus({
                intent: "error",
                message: "Hubo un error al procesar el pago con PayPal.",
              }),
          })
          .render("#paypal-subscribe");

        setIsPayPalReady(true);
        setStatus(null);
      } catch (error) {
        console.error("Failed to render PayPal buttons", error);
        setStatus({
          intent: "error",
          message: "No pudimos iniciar los botones de PayPal.",
        });
      }
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const features = [
    "Chatbot WooCommerce con 2,000 mensajes al mes",
    "Widget sin branding y editor visual listo para usar",
    "Reportes semanales de rendimiento directo a tu correo",
    "Soporte prioritario por email y WhatsApp",
  ];

  const statusStyles: Record<
    NonNullable<Status>["intent"],
    string
  > = {
    info: "border-slate-600 bg-slate-900/70 text-slate-200",
    success: "border-emerald-500/40 bg-emerald-500/10 text-emerald-200",
    error: "border-rose-500/40 bg-rose-500/10 text-rose-200",
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(45,212,191,0.18),transparent_55%)]" />
      <section className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center gap-12 px-6 py-16 md:gap-16 md:px-10 lg:px-16">
        <header className="max-w-2xl space-y-4 text-center md:text-left">
          <p className="inline-flex items-center gap-2 self-center rounded-full border border-emerald-400/40 bg-emerald-500/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200 md:self-start">
            Plan recomendado
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            Escala tu soporte con el plan Basico de Commerce Agents
          </h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Automatiza respuestas, sincroniza catalogos y mantente dentro de tu
            limite mensual con reportes claros y alertas tempranas.
          </p>
        </header>

        <div className="grid w-full gap-10 md:grid-cols-[1.1fr_minmax(320px,1fr)] md:items-start">
          <div className="space-y-6 rounded-3xl border border-slate-800/60 bg-slate-900/50 p-8 shadow-xl shadow-emerald-500/10 backdrop-blur">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <span className="text-sm uppercase tracking-widest text-emerald-300">
                  Basico
                </span>
                <h2 className="text-3xl font-semibold text-white">
                  29 EUR / mes
                </h2>
              </div>
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-200">
                2,000 mensajes incluidos
              </div>
            </div>

            <ul className="space-y-3 text-sm text-slate-300">
              {features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-3 rounded-2xl border border-slate-800 bg-slate-900/60 p-4"
                >
                  <span className="mt-0.5 inline-flex h-5 w-5 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-500/10 text-emerald-300">
                    <svg
                      className="h-3 w-3"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        d="M4 8.5L6.5 11L12 5"
                        stroke="currentColor"
                        strokeWidth="1.6"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 text-sm text-slate-300">
              <h3 className="mb-2 text-base font-semibold text-white">
                Garantia de resultados
              </h3>
              <p>
                Si no ves mejoras en la conversion o ahorras tiempo en soporte
                tras 30 dias, te ayudamos a optimizar el bot sin coste extra.
              </p>
            </div>
          </div>

          <div className="space-y-4 rounded-3xl border border-slate-800/60 bg-slate-900/60 p-6 shadow-lg shadow-slate-900/40 backdrop-blur">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-white">
                Activa tu suscripcion
              </h2>
              <p className="text-sm text-slate-400">
                Procesamos el pago con PayPal de forma segura. Puedes cancelar
                cuando quieras desde tu panel.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 text-sm text-slate-300">
              <p>
                Tu facturacion se adapta automaticamente si superas los 2,000
                mensajes. Te avisaremos antes de llegar al limite.
              </p>
            </div>

            {!isPayPalReady && (
              <div className="rounded-2xl border border-slate-800/70 bg-slate-950/50 p-6 text-center text-sm text-slate-400">
                <div className="mx-auto mb-3 h-10 w-10 animate-spin rounded-full border-2 border-emerald-300/60 border-t-transparent" />
                <p>Cargando botones de suscripcion...</p>
              </div>
            )}

            <div
              id="paypal-subscribe"
              className="rounded-2xl bg-white p-4 shadow-lg"
            />

            <p className="text-xs text-slate-500">
              Al continuar aceptas los terminos del servicio y tu plan se renueva
              cada 30 dias hasta que lo canceles.
            </p>

            {status && (
              <p
                className={[
                  "rounded-2xl border px-4 py-3 text-sm",
                  statusStyles[status.intent],
                ].join(" ")}
                role="status"
                aria-live="polite"
              >
                {status.message}
              </p>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
