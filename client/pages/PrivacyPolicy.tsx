export default function PrivacyPolicy() {
  return (
    <div className="mx-auto max-w-3xl space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight text-foreground">
          Privacy Policy
        </h1>
        <p className="text-sm text-foreground/60">
          Last Updated: February 16, 2026
        </p>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire – Inclusive Learning Platform ("we", "our", "us"), developed by Team Prismatics, is committed to protecting the privacy and safety of our users, especially students and learners using our accessibility tools.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          1. Information We Collect
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          We may collect the following information:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Name and email address during signup</li>
          <li className="list-disc">Dyslexia assessment results and onboarding responses</li>
          <li className="list-disc">Learning content pasted into reading tools</li>
          <li className="list-disc">AI-generated summaries and quiz activity</li>
          <li className="list-disc">Support chat interactions</li>
          <li className="list-disc">Platform usage data for feature improvement</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          2. How We Use This Information
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Your data is used to:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Personalize your learning experience</li>
          <li className="list-disc">Store your progress and activity history</li>
          <li className="list-disc">Improve accessibility and AI features</li>
          <li className="list-disc">Provide emotional support tools</li>
          <li className="list-disc">Facilitate connections with NGOs or therapists when requested</li>
        </ul>
        <p className="text-base leading-relaxed text-foreground/80">
          We do not sell, rent, or trade your personal data.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          3. Data Security
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          We implement secure authentication and database systems to protect user information. Access to personal data is restricted and safeguarded using modern security practices.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          4. Third-Party Services
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Claire may use trusted third-party services (such as AI providers or database hosting platforms) to operate certain features. These services adhere to their own privacy and security policies.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          5. User Control & Rights
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          Users may request to:
        </p>
        <ul className="space-y-2 pl-6 text-base leading-relaxed text-foreground/80">
          <li className="list-disc">Access their stored data</li>
          <li className="list-disc">Delete their account</li>
          <li className="list-disc">Remove stored history</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          6. Children & Student Safety
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          As Claire is designed for learners, we prioritize data safety and minimize personal data collection wherever possible.
        </p>
      </section>

      {/* <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-foreground">
          7. Contact
        </h2>
        <p className="text-base leading-relaxed text-foreground/80">
          For privacy-related queries or concerns:
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
          This privacy policy may be updated periodically. We encourage users to review it regularly.
        </p>
      </div>
    </div>
  );
}
