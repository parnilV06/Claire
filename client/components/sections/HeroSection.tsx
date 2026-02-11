import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/10 via-accent/25 to-secondary/40 px-6 py-16 shadow-lg shadow-primary/10 sm:px-10 md:py-20">
      <div className="mx-auto flex flex-col items-center max-w-4xl gap-10 text-center">
        <span className="mx-auto inline-flex items-center justify-center rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Inclusive learning platform
        </span>
        <h1 className="text-3xl font-bold tracking-tight text-black sm:text-4xl md:text-5xl">
          Claire: Calmer learning journeys for dyslexic students
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-black sm:text-lg">
          Personalized tools, mindful coaching, and compassionate emotional support
          that help students read, write, and express ideas with confidence while
          easing anxiety for learners—and their families.
        </p>
        <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6">
          <Link to="/assessment">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-primary/40 px-8 text-base text-primary shadow-sm hover:bg-primary/10"
            >
              Take the guided assessment
            </Button>
          </Link>
          <Link to="/tools">
            <Button
              size="lg"
              variant="outline"
              className="rounded-full border-primary/40 px-8 text-base text-primary shadow-sm hover:bg-primary/10"
            >
              Try the calming canvas
            </Button>
          </Link>
        </div>
      </div>
      <div className="pointer-events-none absolute -left-32 bottom-6 hidden h-64 w-64 rounded-full bg-primary/20 blur-3xl sm:block" />
      <div className="pointer-events-none absolute -right-24 top-6 hidden h-72 w-72 rounded-full bg-secondary/35 blur-3xl sm:block" />
    </section>
  );
}

const heroHighlights = [
  {
    label: "Calming routine",
    title: "5-minute regulation check-ins",
    description:
      "Breathing prompts, affirmations, and grounding audio that reduce learning anxiety before each session.",
  },
  {
    label: "Personalized tools",
    title: "Adaptive reading workspace",
    description:
      "Adjust spacing, fonts, and colors, plus instant simplification and text-to-speech tuned to each profile.",
  },
  {
    label: "Family support",
    title: "Parent + teacher insights",
    description:
      "Shared dashboard with progress markers, conversation starters, and emotional guidance crafted by specialists.",
  },
];
