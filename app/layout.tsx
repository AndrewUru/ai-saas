// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QueryProvider from "./query-provider";
import AIWidget from "@/components/AIWidget";


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
    <html lang="es">
      <body className="flex min-h-screen flex-col">
        <QueryProvider>
          <Navbar />
          {children}
          <Footer />
        </QueryProvider>
        <AIWidget />
      </body>
    </html>
  );
}
