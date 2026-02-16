export default function Accessibility() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Accessibility Statement
        </h1>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire – Inclusive Learning Platform is built with the mission of making learning more accessible, inclusive, and supportive for dyslexic students and neurodiverse learners.
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          This project is developed by <strong>Team Prismatics</strong> with a focus on reducing learning barriers through thoughtful design and assistive technology.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Our Accessibility Features
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire currently provides:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">OpenDyslexic font integration for improved readability</li>
          <li className="list-disc">Adjustable letter spacing and line spacing</li>
          <li className="list-disc">Calm reading canvas interface</li>
          <li className="list-disc">Distraction-reduced layout design</li>
          <li className="list-disc">Text-to-Speech playback for reading assistance</li>
          <li className="list-disc">AI-generated simplified summaries</li>
          <li className="list-disc">AI-powered comprehension quizzes</li>
          <li className="list-disc">Emotional wellbeing support chat</li>
        </ul>
        <p className="text-base leading-relaxed text-foreground/80">
          These features are designed to reduce cognitive overload and improve comprehension comfort.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Our Design Philosophy
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          We believe accessibility is not an add-on — it is a foundation.
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          Our platform is built to:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Support diverse learning speeds</li>
          <li className="list-disc">Reduce reading anxiety</li>
          <li className="list-disc">Improve information retention</li>
          <li className="list-disc">Provide emotional reassurance while learning</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Continuous Improvement
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Accessibility is an ongoing journey. As Claire evolves, we aim to:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Expand assistive reading tools</li>
          <li className="list-disc">Improve UI customization options</li>
          <li className="list-disc">Enhance speech and audio accessibility</li>
          <li className="list-disc">Collaborate with educators and specialists</li>
        </ul>
      </section>

      {/* <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          Feedback & Support
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          If you experience accessibility barriers while using Claire, we encourage you to reach out so we can improve.
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          Email:{" "}
          <a
            href="mailto:accessibility@claire-platform.org"
            className="text-primary underline hover:text-primary/80"
          >
            accessibility@claire-platform.org
          </a>
        </p>
      </section> */}

      <div className="border-t border-border/50 pt-8">
        <p className="text-sm text-foreground/60">
          We are committed to making learning accessible for everyone. This statement reflects our current features and ongoing commitment to inclusive design.
        </p>
      </div>
    </div>
  );
}
