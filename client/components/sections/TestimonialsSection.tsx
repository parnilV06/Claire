const testimonials = [
  {
    quote:
      "Claire is the first tool that calms my students before reading. They stay encouraged and reach milestones faster.",
    name: "Alicia M.",
    role: "Special education teacher",
  },
  {
    quote:
      "The parent dashboard helped us celebrate small wins and understand when to step in with hugs versus homework.",
    name: "Jordan K.",
    role: "Parent of 4th grader",
  },
  {
    quote:
      "I finally feel safe trying longer passages. The voice notes and mind maps keep my ideas clear and exciting.",
    name: "Riya, 12",
    role: "Student",
  },
];

export function TestimonialsSection() {
  return (
    <section className="mt-24">
      <div className="space-y-4 text-center">
        <span className="inline-flex items-center justify-center rounded-full bg-foreground/10 px-4 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-foreground/70">
          Voices from our community
        </span>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Built with learners, families, and specialists
        </h2>
      </div>
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {testimonials.map((testimonial) => (
          <article
            key={testimonial.name}
            className="flex h-full flex-col gap-4 rounded-3xl border border-border/70 bg-white/80 p-6 text-left shadow-md backdrop-blur-sm"
          >
            <p className="text-base leading-7 text-foreground/80">“{testimonial.quote}”</p>
            <div className="pt-4 text-sm font-semibold text-foreground">
              {testimonial.name}
              <p className="text-xs font-normal uppercase tracking-wide text-foreground/60">
                {testimonial.role}
              </p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
