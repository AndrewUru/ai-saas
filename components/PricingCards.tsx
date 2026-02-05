//C:\ai-saas\components\PricingCards.tsx
"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

const plans = [
  {
    id: "free",
    name: "Free",
    headline: "Start building agents",
    price: "0",
    period: "forever",
    description: "Perfect to test the dashboard and launch up to five agents.",
    features: ["Up to 5 agents", "Standard support", "Basic customization"],
    highlight: false,
    badge: "Free forever",
  },
  {
    id: "pro",
    name: "Pro",
    headline: "Scale with confidence",
    price: "22",
    period: "one-time",
    description:
      "Remove branding, get priority support, and unlock higher limits.",
    features: ["Removed branding", "Priority support", "Higher limits & early access"],
    highlight: true,
    badge: "Best value",
  },
] as const;

export default function PricingCards({ clientId }: { clientId: string }) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  if (!clientId) {
    return (
      <div className="text-center text-rose-400">
        Error: PayPal Client ID not configured.
      </div>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "EUR",
        intent: "capture",
        components: "buttons",
      }}
    >
      {successMsg && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-emerald-500/50 bg-emerald-950/90 px-6 py-3 text-emerald-200 backdrop-blur-md">
          {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-full border border-rose-500/50 bg-rose-950/90 px-6 py-3 text-rose-200 backdrop-blur-md">
          {errorMsg}
        </div>
      )}

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`relative flex flex-col gap-5 rounded-3xl border bg-slate-900/70 p-6 shadow-xl transition hover:-translate-y-1 hover:shadow-2xl ${
              plan.highlight
                ? "border-emerald-400/60 bg-gradient-to-b from-emerald-500/10 via-slate-900/80 to-slate-900/90 shadow-emerald-500/10"
                : "border-slate-800 shadow-slate-900/50"
            }`}
          >
            {plan.badge && (
              <span
                className={`absolute right-4 top-4 inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  plan.highlight
                    ? "border-emerald-400/40 bg-emerald-500/20 text-emerald-200"
                    : "border-slate-700 bg-slate-800 text-slate-300"
                }`}
              >
                {plan.badge}
              </span>
            )}

            <div className="space-y-1">
              <p
                className={`text-xs uppercase tracking-[0.22em] ${
                  plan.highlight ? "text-emerald-300" : "text-slate-400"
                }`}
              >
                {plan.headline}
              </p>
              <h2 className="text-3xl font-bold text-white">{plan.name}</h2>
              <p className="text-sm leading-relaxed text-slate-300">
                {plan.description}
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              {plan.price === "0" ? (
                <span className="text-4xl font-bold text-white">€0</span>
              ) : (
                <>
                  <span className="text-4xl font-bold text-white">
                    €{plan.price}
                  </span>
                  <span className="text-sm font-medium text-slate-400">
                    one-time
                  </span>
                </>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4">
              <ul className="space-y-3 text-sm text-slate-300">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
                        plan.highlight ? "bg-emerald-400" : "bg-slate-500"
                      }`}
                    />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-6">
              {plan.price === "0" ? (
                <Link
                  href="/dashboard"
                  className="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-700 font-semibold text-slate-200 transition hover:border-emerald-400/50 hover:bg-emerald-400/5 hover:text-emerald-200"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3">
                    <PayPalButtons
                      style={{
                        layout: "vertical",
                        shape: "pill",
                        label: "paypal",
                      }}
                      createOrder={async () => {
                        setErrorMsg("");
                        setSuccessMsg("");

                        // ✅ No mandamos amount/currency desde el client
                        const res = await fetch("/api/paypal/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ plan: "pro" }),
                        });

                        const data = await res.json();

                        if (!res.ok || !data?.orderId) {
                          throw new Error(
                            data?.error || "Could not create order"
                          );
                        }

                        return data.orderId as string;
                      }}
                      onApprove={async (data) => {
                        setErrorMsg("");
                        setSuccessMsg(
                          "Payment approved. Activating your account…"
                        );

                        const res = await fetch("/api/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: data.orderID }),
                        });

                        const out = await res.json();

                        if (!res.ok || !out?.ok) {
                          setSuccessMsg("");
                          setErrorMsg(out?.error || "Payment capture failed");
                          return;
                        }

                        setSuccessMsg("PRO activated! Redirecting…");
                        router.push("/dashboard");
                        router.refresh();
                      }}
                      onCancel={() => {
                        setSuccessMsg("");
                        setErrorMsg("");
                      }}
                      onError={(err) => {
                        setSuccessMsg("");
                        setErrorMsg(
                          err instanceof Error ? err.message : "PayPal error"
                        );
                      }}
                    />
                  </div>

                  <p className="text-center text-xs text-slate-400">
                    Secure checkout powered by PayPal.
                  </p>
                </div>
              )}
            </div>
          </article>
        ))}
      </div>
    </PayPalScriptProvider>
  );
}

