// app/layout.tsx
import "./globals.css";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import QueryProvider from "./query-provider";

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

        <script
          async
          src="https://agentes.elsaltoweb.es/api/widget?key=agt_419oweh9oi6mjswq07p"
        ></script>
      </body>
    </html>
  );
}
