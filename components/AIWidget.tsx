// components/AIWidget.tsx
"use client";

import Script from "next/script";

export default function AIWidget() {
  return (
    <Script
      src="https://agentes.elsaltoweb.es/api/widget?key=agt_v41zuu0e7mamgjm3gaq&accent=e2e4e9&brand=ElSaltoWeb&label=Chatea+con+nosotros&greeting=%C2%BFEn+qu%C3%A9+puedo+ayudarte+hoy%3F&position=right"
      strategy="afterInteractive"
      onError={() => console.error("[AI SaaS] Could not load the widget.")}
    />
  );
}
