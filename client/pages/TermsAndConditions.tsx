export default function TermsAndConditions() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Terms & Conditions
        </h1>
        <p className="text-sm text-foreground/60">
          Last Updated: February 16, 2026
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          Welcome to Claire – Inclusive Learning Platform. Claire is a project developed by <strong>Team Prismatics</strong>. By accessing or using this platform, you agree to the following terms.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          1. Purpose of the Platform
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire is designed to support dyslexic learners and neurodiverse students through inclusive learning tools and emotional wellbeing support.
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire is <strong>not a replacement for professional medical, psychological, or educational diagnosis or treatment</strong>.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          2. Use of AI Features
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          The platform includes AI-generated features such as:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Text summaries</li>
          <li className="list-disc">Learning quizzes</li>
          <li className="list-disc">Emotional support chat responses</li>
        </ul>
        <p className="text-base leading-relaxed text-foreground/80">
          These outputs are generated automatically and may not always be fully accurate. They are intended to assist learning and reflection, not to provide expert or clinical advice.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          3. User Responsibilities
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          By using Claire, users agree to:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Use the platform respectfully and responsibly</li>
          <li className="list-disc">Provide accurate information during signup</li>
          <li className="list-disc">Avoid uploading harmful, abusive, or illegal content</li>
          <li className="list-disc">Not misuse AI tools or support systems</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          4. Accounts & Security
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Users are responsible for maintaining the confidentiality of their account credentials. Claire is not responsible for unauthorized access caused by user negligence.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          5. Support, NGOs, and Therapist Connections
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire may facilitate connections with NGOs or therapists upon user request. These connections are supportive in nature, and Claire does not provide licensed therapy services directly.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          6. Platform Availability
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          As a student-developed project, features may evolve, change, or be temporarily unavailable.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          7. Updates to Terms
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          These Terms may be updated as the platform grows. Continued use of Claire indicates acceptance of the updated Terms.
        </p>
      </section>

      {/* <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          8. Contact
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          For questions or concerns regarding these Terms:
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          Email:{" "}
          <a
            href="mailto:support@claire-platform.org"
            className="text-primary underline hover:text-primary/80"
          >
            support@claire-platform.org
          </a>
        </p>
      </section> */}

      <div className="border-t border-border/50 pt-8">
        <p className="text-sm text-foreground/60">
          These terms and conditions may be updated periodically. We encourage users to review them regularly.
        </p>
      </div>
    </div>
  );
}
