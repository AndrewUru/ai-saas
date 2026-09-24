"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

import CookieBanner from "@/components/CookieBanner";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";

type AppChromeProps = {
  children: React.ReactNode;
  widgetSrc: string;
};

function isDashboardPath(pathname: string | null) {
  return pathname === "/dashboard" || pathname?.startsWith("/dashboard/");
}

function isStandalonePath(pathname: string | null) {
  return (
    isDashboardPath(pathname) || pathname === "/login" || pathname === "/signup"
  );
}

export default function AppChrome({ children, widgetSrc }: AppChromeProps) {
  const pathname = usePathname();

  if (isStandalonePath(pathname)) {
    return <>{children}</>;
  }

  return (
    <>
      <Navbar data-oid="96zh0-c" />
      <main className="flex-1" data-oid="psn38tv">
        {children}
      </main>
      <Footer data-oid=":1v7d4h" />
      <CookieBanner data-oid="lkdky9x" />
      <Script src={widgetSrc} strategy="afterInteractive" data-oid="gf3b1-j" />
    </>
  );
}
