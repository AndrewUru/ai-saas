"use client";

import { useEffect } from "react";

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
    actions: PayPalSubscriptionActions
  ) => Promise<string>;
  onApprove: (data: { subscriptionID: string }) => Promise<void>;
  onError: () => void;
};

type PayPalSDK = {
  Buttons: (config: PayPalButtonsConfig) => PayPalButtons;
};

declare global {
  interface Window {
    paypal?: PayPalSDK;
  }
}

type SubscriptionConfirmResponse = {
  ok: boolean;
  error?: string;
};

export default function BillingPage() {
  useEffect(() => {
    const src = `https://www.paypal.com/sdk/js?client-id=${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}&vault=true&intent=subscription&currency=EUR`;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = () => {
      const paypal = window.paypal;
      if (!paypal) {
        console.error("PayPal SDK not available on window");
        alert("PayPal SDK failed to load");
        return;
      }

      const planId =
        process.env.NEXT_PUBLIC_PAYPAL_PLAN_BASIC ??
        process.env.PAYPAL_PLAN_BASIC;

      if (!planId) {
        console.error("Missing PayPal plan id environment variables");
        alert("PayPal plan is not configured");
        return;
      }

      paypal
        .Buttons({
          style: { layout: "vertical", color: "gold", label: "subscribe" },
          createSubscription: (_data, actions) =>
            actions.subscription.create({
              plan_id: planId,
            }),
          onApprove: async (data) => {
            const response = await fetch(
              "/api/paypal/subscription/confirm",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  subscriptionID: data.subscriptionID,
                  plan: "basic",
                }),
              }
            );
            const result =
              (await response.json()) as SubscriptionConfirmResponse;
            alert(
              result.ok ? "Listo. Suscripcion activada" : `Error: ${result.error}`
            );
            if (result.ok) window.location.href = "/dashboard";
          },
          onError: () => alert("Error PayPal"),
        })
        .render("#paypal-subscribe");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="rounded-2xl bg-white p-4 shadow">
        <h1 className="text-xl font-semibold">Plan Basico - 29 €/mes</h1>
        <p className="text-sm text-gray-600">
          Chatbot Woo + 2.000 mensajes/mes + sin branding.
        </p>
      </div>
      <div id="paypal-subscribe" className="rounded-2xl bg-white p-4 shadow" />
    </div>
  );
}
