import { CalendarHeart, Compass, LifeBuoy } from "lucide-react";
import { Link } from "react-router-dom";

const supportCards = [
  {
    icon: LifeBuoy,
    title: "AI emotional companion",
    description:
      "Gentle chatbot checks mood, offers reframing prompts, and surfaces coping strategies modeled after therapist scripts.",
  },
  {
    icon: Compass,
    title: "Guided regulation",
    description:
      "Breathing timers, sensory breaks, and grounding exercises adapt to each student's stress signals in real time.",
  },
  {
    icon: CalendarHeart,
    title: "Care network",
    description:
      "Connect with NGOs, school psychologists, or partner therapists for escalated care and long-term planning.",
  },
];

export function TherapySupportSection() {
  return (
    <section className="mt-24 rounded-3xl border border-border/70 bg-gradient-to-br from-accent/35 via-white/90 to-secondary/30 p-8 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
        <div className="flex-1 space-y-4">
          <span className="inline-flex items-center rounded-full bg-primary/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary">
            Therapy &amp; emotional support
          </span>
          <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
            Compassion-first support for every learning milestone
          </h2>
          <p className="text-base leading-7 text-foreground/75 sm:text-lg">
            Students can request encouragement, reset with guided meditations, or connect with a human specialist when needed. Parents receive reassurance and action plans tailored to each moment.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              to="/support"
              className="inline-flex items-center rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/40"
            >
              Explore support pathways
            </Link>
            <a
              href="mailto:community@brightpath.app"
              className="inline-flex items-center rounded-full border border-primary/40 px-5 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              Partner with us
            </a>
          </div>
        </div>
        <div className="flex-1 grid gap-4 sm:grid-cols-3">
          {supportCards.map(({ icon: Icon, title, description }) => (
            <article
              key={title}
              className="flex flex-col gap-3 rounded-2xl border border-border/60 bg-white/75 p-5 text-sm text-foreground/75 shadow-sm backdrop-blur"
            >
              <Icon className="h-5 w-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">{title}</h3>
              <p className="leading-6">{description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
