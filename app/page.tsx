import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import { Workflow } from "@/components/landing/Workflow";

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
