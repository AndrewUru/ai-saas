// components/AIWidget.tsx
"use client";
import Script from "next/script";

export default function AIWidget() {
  return (
    <Script
      src="https://agentes.elsaltoweb.es/api/widget?key=agt_419oweh9oi6mjswq07p&accent=d324eb&brand=AI+Widget&label=Chatea+con+nosotros&greeting=%C2%BFEn+qu%C3%A9+puedo+ayudarte+hoy%3F&colorHeaderBg=008069&colorHeaderText=ffffff&colorChatBg=efe7dd&preview=1"
      strategy="afterInteractive"
      onError={() => console.error("[AI SaaS] Could not load the widget.")}
    />
  );
}
