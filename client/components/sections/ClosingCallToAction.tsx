import { Link } from "react-router-dom";

import { Button } from "@/components/ui/button";

export function ClosingCallToAction() {
  return (
    <section className="mt-24 rounded-3xl border border-border/70 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/30 p-10 text-center shadow-2xl shadow-primary/20">
      <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
        Ready to calm the reading journey?
      </h2>
      <p className="mx-auto mt-4 max-w-2xl text-base text-foreground/75 sm:text-lg">
        Join schools and families turning dyslexia support into joyful breakthroughs. BrightPath keeps students regulated, expressive, and excited to learn.
      </p>
      <div className="mt-6 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <Link to="/signup">
          <Button size="lg" className="rounded-full px-8 text-base shadow-lg shadow-primary/40">
            Create a student profile
          </Button>
        </Link>
        <Link to="/contact">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-primary/40 px-8 text-base text-primary hover:bg-primary/10"
          >
            Talk with our team
          </Button>
        </Link>
      </div>
    </section>
  );
}
