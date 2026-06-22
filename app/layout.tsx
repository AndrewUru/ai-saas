import "./globals.css";
import type { Metadata } from "next";

import AppChrome from "@/components/AppChrome";
import QueryProvider from "./query-provider";

const widgetKey = "agt_419oweh9oi6mjswq07p";
const widgetSrc =
  process.env.NODE_ENV === "development"
    ? `/api/widget?key=${widgetKey}&preview=1`
    : `https://agentes.elsaltoweb.es/api/widget?key=${widgetKey}`;

export const metadata: Metadata = {
  title: "AI SaaS",
  description: "Proyecto SaaS con Next.js + Supabase + LangChain",
  icons: {
    icon: "/logo.svg",
  },
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
          <AppChrome widgetSrc={widgetSrc}>{children}</AppChrome>
        </QueryProvider>
      </body>
    </html>
  );
}
