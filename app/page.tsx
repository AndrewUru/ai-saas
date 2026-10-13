import type { Metadata } from "next";

import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import { Workflow } from "@/components/landing/Workflow";

export const metadata: Metadata = {
  title: "AI Commerce Agents | Turn conversations into revenue signals",
  description:
    "Deploy branded AI agents for WooCommerce and Shopify that answer shoppers, recommend products, detect sales friction, and suggest improvements.",
};

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
