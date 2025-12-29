"use client";

import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  planName: string; // e.g., "basic", "pro"
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function SubscriptionPayPalButton({
  amount,
  currency = "USD",
  planName,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="relative z-0 w-full">
      {isProcessing && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/50 backdrop-blur-sm">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent" />
        </div>
      )}
      <PayPalButtons
        disabled={isProcessing}
        style={{
          color: "blue",
          shape: "pill",
          label: "pay",
          height: 48,
        }}
        createOrder={(data, actions) => {
          setIsProcessing(true);
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                description: `Suscripción ${planName}`,
                amount: {
                  currency_code: currency,
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={async (data, _actions) => {
          try {
            const orderID = data.orderID;
            if (!orderID) throw new Error("orderID missing");

            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                orderID,
              }),
            });

            const result = await res.json();
            if (!res.ok || !result.ok) {
              throw new Error(result.error || "Error al capturar pago");
            }

            onSuccess();
          } catch (err) {
            console.error(err);
            onError(err instanceof Error ? err.message : "Fallo en el pago");
          } finally {
            setIsProcessing(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          onError("Hubo un error conectando con PayPal");
          setIsProcessing(false);
        }}
        onCancel={() => setIsProcessing(false)}
      />
    </div>
  );
}
