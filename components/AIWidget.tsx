// components/AIWidget.tsx
"use client";
import Script from "next/script";

export default function AIWidget() {
  return (
    <Script
      src="https://agentes.elsaltoweb.es/api/widget?key=agt_419oweh9oi6mjswq07p&accent=d324eb&brand=AI+Assistant&label=Chat+with+us&greeting=You+can+always+ask+to+speak+with+a+human.&colorHeaderBg=008069&colorHeaderText=ffffff&colorChatBg=efe7dd&preview=1"
      strategy="afterInteractive"
      onError={() => console.error("[AI SaaS] Could not load the widget.")}
    />
  );
}
