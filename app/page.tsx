import type { Metadata } from "next";

import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import { Workflow } from "@/components/landing/Workflow";
import { getI18n } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return {
    title: t.landing.meta.title,
    description: t.landing.meta.description,
  };
}

export default function HomePage() {
  return (
    <>
      <Hero />
      <Features />
      <Workflow />
      <Testimonials />
      <CallToAction />
    </>
  );
}
