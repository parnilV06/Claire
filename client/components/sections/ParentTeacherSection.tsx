import { HeartPulse, LineChart, Users } from "lucide-react";

const progressData = [
  {
    title: "Reading fluency",
    percentage: 68,
    description: "Words correct per minute increased steadily with reduced anxiety markers.",
  },
  {
    title: "Self-advocacy",
    percentage: 82,
    description: "Student uses supportive language to request breaks and celebrate wins.",
  },
  {
    title: "Confidence index",
    percentage: 74,
    description: "Weekly reflections track positive mood shifts and lower stress spikes.",
  },
];

const guidance = [
  {
    icon: Users,
    title: "Shared action plans",
    content:
      "Weekly digest makes it simple for parents, tutors, and teachers to align on the same strengths and focus areas.",
  },
  {
    icon: LineChart,
    title: "Insights you can trust",
    content:
      "AI highlights patterns in practice, energy levels, and focus so adults can intervene with empathy, not pressure.",
  },
  {
    icon: HeartPulse,
    title: "Emotional scaffolding",
    content:
      "Scripts and conversation starters turn tough days into connection moments backed by child psychologists.",
  },
];

export function ParentTeacherSection() {
  return (
    <section className="mt-24 rounded-3xl border border-border/70 bg-white/85 p-8 shadow-lg backdrop-blur-sm" id="support">
      <div className="flex flex-col gap-10 lg:flex-row">
        <div className="flex-1 space-y-5">
          <span className="inline-flex items-center rounded-full bg-accent/50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent-foreground">
            Parent &amp; teacher view
          </span>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Track progress and nurture emotional safety together
          </h2>
          <p className="text-base text-foreground/75 sm:text-lg">
            BrightPath centralizes learning analytics, mood check-ins, and therapist guidance so that the entire support circle stays informed and compassionate. Every metric is paired with a recommended next step.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {guidance.map(({ icon: Icon, title, content }) => (
              <article
                key={title}
                className="rounded-2xl border border-border/60 bg-muted/50 p-4 text-sm text-foreground/80"
              >
                <div className="flex items-center gap-2 text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="font-semibold">{title}</p>
                </div>
                <p className="mt-2 text-sm leading-6">{content}</p>
              </article>
            ))}
          </div>
        </div>
        <div className="flex-1 rounded-3xl bg-gradient-to-br from-primary/15 via-secondary/30 to-accent/25 p-8 shadow-inner">
          <h3 className="text-xl font-semibold text-foreground">Progress snapshot</h3>
          <p className="mt-2 text-sm text-foreground/75">
            Key indicators update daily and can be shared instantly with guardians or educators.
          </p>
          <div className="mt-6 space-y-5">
            {progressData.map((item) => (
              <div key={item.title} className="space-y-2 rounded-2xl bg-white/70 p-4 shadow-sm backdrop-blur-sm">
                <div className="flex items-center justify-between text-sm font-semibold text-foreground">
                  <span>{item.title}</span>
                  <span>{item.percentage}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
                <p className="text-xs text-foreground/70">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
