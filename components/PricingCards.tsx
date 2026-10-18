"use client";

import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { CheckCircle2, CreditCard, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useI18n } from "@/lib/i18n/client";

export default function PricingCards({ clientId }: { clientId: string }) {
  const { t } = useI18n();
  const pc = t.pricingCards;
  const plans = [
    {
      id: "free",
      name: t.plans.free.name,
      price: "0",
      features: t.plans.free.features,
      highlight: false,
      ...pc.free,
    },
    {
      id: "pro",
      name: t.plans.pro.name,
      price: "22",
      features: t.plans.pro.features,
      highlight: true,
      ...pc.pro,
    },
  ];
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  if (!clientId) {
    return (
      <div className="ui-alert ui-alert--error mt-8 text-center">
        {pc.missingClientId}
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
      {successMsg ? (
        <div className="ui-alert ui-alert--success fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 text-center">
          {successMsg}
        </div>
      ) : null}
      {errorMsg ? (
        <div className="ui-alert ui-alert--error fixed left-1/2 top-4 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 text-center">
          {errorMsg}
        </div>
      ) : null}

      <div className="mt-10 grid gap-5 lg:grid-cols-2">
        {plans.map((plan) => (
          <article
            key={plan.id}
            className={`ui-card relative flex flex-col gap-6 p-6 transition sm:p-8 ${
              plan.highlight
                ? "border-accent/40 bg-accent/5 shadow-[0_0_30px_rgba(212,212,216,0.06)]"
                : "bg-surface/30"
            }`}
          >
            {plan.badge ? (
              <span
                className={`absolute right-5 top-5 inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${
                  plan.highlight
                    ? "border-accent/30 bg-accent/10 text-accent"
                    : "border-border bg-surface text-[var(--foreground-muted)]"
                }`}
              >
                {plan.badge}
              </span>
            ) : null}

            <div className="space-y-2 pr-24">
              <p
                className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${
                  plan.highlight
                    ? "text-accent"
                    : "text-[var(--foreground-muted)]"
                }`}
              >
                {plan.headline}
              </p>
              <h2 className="text-3xl font-bold text-foreground">
                {plan.name}
              </h2>
              <p className="text-sm leading-6 text-[var(--foreground-muted)]">
                {plan.description}
              </p>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-bold text-foreground">
                EUR {plan.price}
              </span>
              <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[var(--foreground-muted)]">
                {plan.period}
              </span>
            </div>

            <div className="border-t border-border/70 pt-5">
              <ul className="space-y-3 text-sm text-[var(--foreground-muted)]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-auto pt-6">
              {plan.price === "0" ? (
                <Link
                  href="/dashboard"
                  className="ui-button ui-button--secondary h-12 w-full"
                >
                  {pc.goToDashboard}
                </Link>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-2xl border border-border bg-background/45 p-2 shadow-inner shadow-black/30">
                    <div className="mb-2 flex items-center justify-between px-2 pt-1 text-xs text-[var(--foreground-muted)]">
                      <span className="inline-flex items-center gap-2">
                        {isProcessing ? (
                          <Loader2
                            className="ui-loader-icon h-3.5 w-3.5 text-accent"
                            aria-hidden="true"
                          />
                        ) : (
                          <CreditCard
                            className="h-3.5 w-3.5 text-accent"
                            aria-hidden="true"
                          />
                        )}
                        {isProcessing ? pc.processing : pc.payOnce}
                      </span>
                      <span>EUR 22</span>
                    </div>
                    <PayPalButtons
                      disabled={isProcessing}
                      style={{
                        color: "black",
                        height: 48,
                        shape: "pill",
                        label: "pay",
                        layout: "vertical",
                        tagline: false,
                      }}
                      createOrder={async () => {
                        setErrorMsg("");
                        setSuccessMsg("");
                        setIsProcessing(true);

                        const res = await fetch("/api/paypal/create-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ plan: "pro" }),
                        });

                        const data = await res.json();

                        if (!res.ok || !data?.orderId) {
                          setIsProcessing(false);
                          throw new Error(
                            data?.error || pc.createOrderError,
                          );
                        }

                        return data.orderId as string;
                      }}
                      onApprove={async (data) => {
                        setErrorMsg("");
                        setSuccessMsg(pc.approved);

                        const res = await fetch("/api/paypal/capture-order", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ orderId: data.orderID }),
                        });

                        const out = await res.json();

                        if (!res.ok || !out?.ok) {
                          setSuccessMsg("");
                          setErrorMsg(out?.error || pc.captureFailed);
                          setIsProcessing(false);
                          return;
                        }

                        setSuccessMsg(pc.activated);
                        router.push("/dashboard");
                        router.refresh();
                      }}
                      onCancel={() => {
                        setSuccessMsg("");
                        setErrorMsg("");
                        setIsProcessing(false);
                      }}
                      onError={(err) => {
                        setSuccessMsg("");
                        setErrorMsg(
                          err instanceof Error ? err.message : pc.paypalError,
                        );
                        setIsProcessing(false);
                      }}
                    />
                  </div>

                  <p className="text-center text-xs text-[var(--foreground-muted)]">
                    {pc.secureNote}
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
