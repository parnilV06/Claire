import { useEffect } from "react";
import { useLocation } from "react-router-dom";

import { AboutSection } from "@/components/sections/AboutSection";
import { HeroSection } from "@/components/sections/HeroSection";
// Home-page only: keep hero + about. Other sections moved to dedicated pages.

export default function Index() {
  const { hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      return;
    }
    const target = document.getElementById(hash.replace("#", ""));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [hash]);
  return (
  <div className="space-y-24 flex flex-col items-center">
      <HeroSection />
      <AboutSection />
    <section className="w-full flex justify-center">
      <div className="grid gap-10 rounded-3xl border border-border/70 bg-white/80 p-8 shadow-lg backdrop-blur-sm w-full max-w-5xl mx-auto">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Why dyslexia?
          </span>
          <h2 className="text-2xl font-semibold text-foreground">Because access and calm unlock learning</h2>
          <p className="text-sm text-foreground/75">
            Dyslexia affects how the brain processes written language. With the right supports, students can read and write with confidence. Claire lowers stress and adapts the workspace so effort goes into ideas—not decoding.
          </p>
        </div>
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full bg-secondary/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            What is dyslexia?
          </span>
          <p className="text-sm text-foreground/75">
            Dyslexia is a common learning difference that mainly impacts reading and spelling. It is not a problem with intelligence. Visual spacing, phonological awareness, and memory can all play a role. Tools like adjustable fonts, spacing, and gentle TTS help make text clearer and calmer.
          </p>
        </div>
      </div>
    </section>
    </div>
  );
}
