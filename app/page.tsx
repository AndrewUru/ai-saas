// app/page.tsx
import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import { Workflow } from "@/components/landing/Workflow";

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white">
      <Hero />
      <Features />
      <Workflow />
      <Testimonials />
      <CallToAction />
    </main>
  );
}
