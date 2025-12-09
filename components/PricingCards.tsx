"use client";

import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import { SubscriptionPayPalButton } from "./PayPalButton";
import Link from "next/link";
import { useState } from "react";

const plans = [
  {
    id: "free",
    name: "Free",
    headline: "Start building agents",
    price: "0",
    period: "per month",
    description: "Perfect to test the dashboard and launch your first agent.",
    features: [
      "1 active agent",
      "Standard support",
      "Basic customization",
    ],
    highlight: false,
    badge: "Free forever",
  },
  {
    id: "basic",
    name: "Basic",
    headline: "Scale your reach",
    price: "29",
    period: "per month",
    description: "For agencies and stores growing their automated support.",
    features: [
      "Up to 5 agents",
      "WooCommerce Deep Integration",
      "Priority email support",
      "Removed branding",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "pro",
    name: "Pro",
    headline: "Maximum power",
    price: "79",
    period: "per month",
    description: "For high-volume operations requiring dedicated resources.",
    features: [
      "Unlimited agents",
      "Custom functions access",
      "Dedicated success manager",
      "SLA 99.9%",
    ],
    highlight: false,
    badge: null,
  },
];

export default function PricingCards({ clientId }: { clientId: string }) {
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  if (!clientId) {
    return (
      <div className="text-center text-rose-400">
        Error: PayPal Client ID not configured.
      </div>
    );
  }

  return (
    <PayPalScriptProvider options={{ clientId, currency: "USD" }}>
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

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
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
              <p className="text-sm text-slate-300 leading-relaxed">
                {plan.description}
              </p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-bold text-white">
                ${plan.price}
              </span>
              {plan.price !== "0" && (
                <span className="text-sm font-medium text-slate-400">
                  /{plan.period.replace("per ", "")}
                </span>
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
                <SubscriptionPayPalButton
                  planName={plan.id}
                  amount={plan.price}
                  onSuccess={() =>
                    setSuccessMsg(
                      `Plan ${plan.name} activated successfully! Redirecting...`
                    )
                  }
                  onError={(msg) => setErrorMsg(msg)}
                />
              )}
            </div>
          </article>
        ))}
      </div>
    </PayPalScriptProvider>
  );
}
