import "./globals.css";
import type { Metadata } from "next";

import AppChrome from "@/components/AppChrome";
import { SHOWCASE_AGENT_KEY } from "@/lib/agents/showcase";
import { I18nProvider } from "@/lib/i18n/client";
import { getI18n } from "@/lib/i18n/server";
import QueryProvider from "./query-provider";

const widgetKey = SHOWCASE_AGENT_KEY;
const widgetSrc =
  process.env.NODE_ENV === "development"
    ? `/api/widget?key=${widgetKey}&preview=1`
    : `https://agentes.elsaltoweb.es/api/widget?key=${widgetKey}`;

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.meta.title,
    description: t.meta.description,
    icons: {
      icon: "/logo.svg",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { locale, t } = await getI18n();

  return (
    <html lang={locale} suppressHydrationWarning data-oid="tkckfp0">
      <body
        className="flex min-h-screen flex-col"
        suppressHydrationWarning
        data-oid="erq.33-"
      >
        <I18nProvider locale={locale} messages={t}>
          <QueryProvider data-oid="bl6519t">
            <AppChrome widgetSrc={widgetSrc}>{children}</AppChrome>
          </QueryProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
