// lib/paypal-verify.ts
import { getAccessToken } from "@/lib/paypal";

const base =
  process.env.PAYPAL_ENV === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

type VerifyWebhookSignatureResponse = {
  verification_status: "SUCCESS" | "FAILURE";
};

function getHeader(headers: Headers, name: string): string | null {
  const v = headers.get(name);
  return v && v.length > 0 ? v : null;
}

/**
 * Verifica la firma del webhook contra PayPal.
 * @param rawBody Cuerpo sin parsear (string) del request
 * @param headers Cabeceras originales del request
 * @returns true si la firma es válida
 */
export async function verifyWebhookSignature(
  rawBody: string,
  headers: Headers
): Promise<boolean> {
  const webhookId = process.env.PAYPAL_WEBHOOK_ID;
  if (!webhookId) {
    // En desarrollo podrías devolver true, pero en prod es obligatorio
    throw new Error("Falta PAYPAL_WEBHOOK_ID");
  }

  const payload = {
    auth_algo: getHeader(headers, "paypal-auth-algo"),
    cert_url: getHeader(headers, "paypal-cert-url"),
    transmission_id: getHeader(headers, "paypal-transmission-id"),
    transmission_sig: getHeader(headers, "paypal-transmission-sig"),
    transmission_time: getHeader(headers, "paypal-transmission-time"),
    webhook_id: webhookId,
    webhook_event: JSON.parse(rawBody) as unknown, // PayPal espera el objeto
  };

  // Validación mínima de headers requeridos
  if (
    !payload.auth_algo ||
    !payload.cert_url ||
    !payload.transmission_id ||
    !payload.transmission_sig ||
    !payload.transmission_time
  ) {
    return false;
  }

  const token = await getAccessToken(); // reutiliza tu helper
  const res = await fetch(`${base}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    // Si PayPal no responde 200, consideramos verificación fallida
    return false;
  }

  const data = (await res.json()) as VerifyWebhookSignatureResponse;
  return data.verification_status === "SUCCESS";
}
