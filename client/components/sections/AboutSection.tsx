const pillars = [
  {
    title: "Personalize with care",
    description:
      "Our assessment blends reading fluency, sensory preferences, and emotional checkpoints to tailor every workspace setting in minutes.",
    items: ["Evidence-based intake", "Sensory comfort mapping", "Instant profile setup"],
  },
  {
    title: "Support the whole child",
    description:
      "We pair AI copilots with therapist-approved guidance so that literacy practice also nurtures confidence and regulation skills.",
    items: ["Micro-affirmations", "Mindful feedback loops", "Escalation to counselors"],
  },
];

const steps = [
  {
    title: "Discover",
    description:
      "Students start with a friendly guided assessment that identifies strengths, challenges, and emotional triggers.",
  },
  {
    title: "Personalize",
    description:
      "Claire configures ideal reading modes, calming rituals, and recommended practice pathways automatically.",
  },
  {
    title: "Thrive",
    description:
      "Learners use the Canvas workspace, receive empathetic feedback, and celebrate milestones with their support circle.",
  },
];

export function AboutSection() {
  return (
    <section className="snap-start flex flex-col items-center justify-center min-h-screen w-full px-4" id="about">
  <div className="grid gap-16 lg:grid-cols-[1.1fr_0.9fr] items-center w-full max-w-5xl mx-auto">
      <div className="space-y-8">
        <div className="space-y-3">
          <span className="inline-flex items-center rounded-full bg-secondary/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-secondary-foreground">
            About Claire
          </span>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Emotional safety meets literacy growth
          </h2>
          <p className="text-base leading-7 text-foreground/75 sm:text-lg">
            Built with dyslexic students, therapists, and inclusive educators, Claire provides an end-to-end support system—from the first sign of reading frustration to joyful independence. Every experience emphasizes clarity, calm, and collaboration.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="flex flex-col gap-4 rounded-2xl border border-border/70 bg-white/70 p-6 shadow-sm backdrop-blur-sm"
            >
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {pillar.title}
                </h3>
                <p className="mt-2 text-sm text-foreground/70">{pillar.description}</p>
              </div>
              <ul className="space-y-2 text-sm text-foreground/80">
                {pillar.items.map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <span className="inline-flex h-2.5 w-2.5 rounded-full bg-primary/70" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
      <div className="rounded-3xl border border-border/70 bg-white/75 p-8 shadow-lg backdrop-blur-sm">
        <h3 className="text-xl font-semibold text-foreground">How it works</h3>
        <ol className="mt-6 space-y-6">
          {steps.map((step, index) => (
            <li key={step.title} className="relative rounded-2xl bg-muted/60 p-5">
              <span className="absolute -left-3 top-5 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {index + 1}
              </span>
              <h4 className="pl-6 text-lg font-semibold text-foreground">
                {step.title}
              </h4>
              <p className="pl-6 pt-2 text-sm text-foreground/75">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
      </div>
    </section>
  );
}
