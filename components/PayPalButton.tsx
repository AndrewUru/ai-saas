"use client";

import { useState } from "react";
import { PayPalButtons } from "@paypal/react-paypal-js";

interface PayPalButtonProps {
  amount: string;
  currency?: string;
  planName: string; // "pro"
  onSuccess: () => void;
  onError: (msg: string) => void;
}

export function PayPalUpgradeButton({
  amount,
  currency = "EUR",
  planName,
  onSuccess,
  onError,
}: PayPalButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  return (
    <div className="relative z-0 w-full" data-oid="kscp631">
      {isProcessing && (
        <div
          className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-slate-900/50 backdrop-blur-sm"
          data-oid="k:jhztc"
        >
          <div
            className="h-5 w-5 animate-spin rounded-full border-2 border-emerald-400 border-t-transparent"
            data-oid="8s2t3ka"
          />
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
                description: `Upgrade ${planName.toUpperCase()} (one-time)`,
                amount: {
                  currency_code: currency,
                  value: amount,
                },
              },
            ],
          });
        }}
        onApprove={async (data) => {
          try {
            const orderId = data.orderID;
            if (!orderId) throw new Error("orderID missing");

            const res = await fetch("/api/paypal/capture-order", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId }),
            });

            const result = await res.json();
            if (!res.ok || !result.ok) {
              throw new Error(result.error || "Error capturing payment");
            }

            onSuccess();
          } catch (err) {
            console.error(err);
            onError(err instanceof Error ? err.message : "Payment failed");
          } finally {
            setIsProcessing(false);
          }
        }}
        onError={(err) => {
          console.error("PayPal Error:", err);
          onError("PayPal connection error");
          setIsProcessing(false);
        }}
        onCancel={() => setIsProcessing(false)}
        data-oid="x0sblea"
      />
    </div>
  );
}
