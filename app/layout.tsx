// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QueryProvider from "./query-provider";
import CookieBanner from "@/components/CookieBanner";
// (opcional) si lo implementaste:
// import AnalyticsGate from "@/components/AnalyticsGate";

export const metadata: Metadata = {
  title: "AI SaaS",
  description: "Proyecto SaaS con Next.js + Supabase + LangChain",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning data-oid="tkckfp0">
      <body
        className="flex min-h-screen flex-col"
        suppressHydrationWarning
        data-oid="erq.33-"
      >
        <QueryProvider data-oid="bl6519t">
          <Navbar data-oid="96zh0-c" />
          <main className="flex-1" data-oid="psn38tv">
            {children}
          </main>
          <Footer data-oid=":1v7d4h" />
        </QueryProvider>

        {/* (opcional) Gate para analytics/marketing si lo usas */}
        {/* <AnalyticsGate /> */}

        {/* ✅ Banner de cookies */}
        <CookieBanner data-oid="lkdky9x" />

        {/* ✅ Widget: mejor con next/script */}
        <Script
          src="https://agentes.elsaltoweb.es/api/widget?key=agt_419oweh9oi6mjswq07p"
          strategy="afterInteractive"
          data-oid="gf3b1-j"
        />
      </body>
    </html>
  );
}
