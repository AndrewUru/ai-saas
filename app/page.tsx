// app/page.tsx
import { CallToAction } from "@/components/landing/CallToAction";
import { Features } from "@/components/landing/Features";
import { Hero } from "@/components/landing/Hero";
import { Testimonials } from "@/components/landing/Testimonials";
import { Workflow } from "@/components/landing/Workflow";

export default function HomePage() {
  return (
    <main className="bg-slate-950 text-white" data-oid="-i2.-g0">
      <Hero data-oid=":sl.s83" />
      <Features data-oid="bwq_1p2" />
      <Workflow data-oid="ydk6aq0" />
      <Testimonials data-oid="zmy_y3t" />
      <CallToAction data-oid="nh2l9.f" />
    </main>
  );
}
