import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Check, GraduationCap, HeartHandshake, Shield } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type AuthMode = "login" | "signup";

type AuthViewProps = {
  initialMode?: AuthMode;
};

type RoleOption = {
  value: string;
  label: string;
  description: string;
};

const roleOptions: RoleOption[] = [
  {
    value: "student",
    label: "I am a student",
    description: "Practice reading, listen to text, and express ideas with calming support.",
  },
  {
    value: "parent",
    label: "I am a parent",
    description: "Track progress, celebrate growth, and receive guidance for emotional support.",
  },
  {
    value: "teacher",
    label: "I am an educator",
    description: "Coordinate learning plans, share insights, and empower inclusive classrooms.",
  },
];

export function AuthView({ initialMode = "login" }: AuthViewProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<RoleOption>(roleOptions[0]);
  const [consentAccepted, setConsentAccepted] = useState(false);

  const headerCopy = useMemo(() => authCopy[mode], [mode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    console.table({ mode, ...payload, role: role.value, consentAccepted });
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
      <aside className="flex flex-col justify-between rounded-3xl border border-border/70 bg-gradient-to-br from-primary/25 via-primary/10 to-accent/30 p-10 text-primary-foreground shadow-2xl shadow-primary/20">
        <div className="space-y-6 text-primary-foreground">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wide">
            <Shield className="h-4 w-4" />
            Safe &amp; inclusive
          </span>
          <h1 className="text-3xl font-semibold leading-snug sm:text-4xl">
            Welcome back to BrightPath
          </h1>
          <p className="text-base leading-relaxed text-primary-foreground/80">
            Sign in to access calming learning journeys, AI coaching, and shared progress dashboards designed for dyslexic students and their support circles.
          </p>
        </div>
        <div className="space-y-4 text-sm text-primary-foreground/90">
          <FeatureRow
            icon={GraduationCap}
            title="Personalized accessibility"
            description="Automated profiles adjust fonts, spacing, and TTS pacing for every session."
          />
          <FeatureRow
            icon={HeartHandshake}
            title="Shared guidance"
            description="Parents and teachers receive emotional support scripts and progress highlights."
          />
          <div className="rounded-2xl bg-white/20 p-4 text-xs text-primary-foreground/80">
            <p className="font-semibold uppercase tracking-[0.2em]">Wellness tip</p>
            <p className="mt-2">
              BrightPath begins each session with a grounding exercise to reduce anxiety. Celebrate each small win!
            </p>
          </div>
        </div>
      </aside>

      <section className="flex flex-col justify-center gap-8 rounded-3xl border border-border/70 bg-white/85 p-10 shadow-xl backdrop-blur-sm">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              mode === "login"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                : "bg-muted text-foreground/70",
            )}
            onClick={() => setMode("login")}
            aria-pressed={mode === "login"}
          >
            Log in
          </button>
          <button
            type="button"
            className={cn(
              "rounded-full px-4 py-2 text-sm font-semibold",
              mode === "signup"
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/40"
                : "bg-muted text-foreground/70",
            )}
            onClick={() => setMode("signup")}
            aria-pressed={mode === "signup"}
          >
            Sign up
          </button>
        </div>

        <div className="space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            {headerCopy.title}
          </h2>
          <p className="text-sm text-foreground/70">{headerCopy.subtitle}</p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {mode === "signup" ? (
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-foreground" htmlFor="full-name">
                Full name
                <input
                  id="full-name"
                  name="fullName"
                  type="text"
                  required
                  autoComplete="name"
                  placeholder="Enter your name"
                  className="mt-2 w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>
            </div>
          ) : null}

          <label className="block text-sm font-semibold text-foreground" htmlFor="email">
            Email address
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              className="mt-2 w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          <label className="block text-sm font-semibold text-foreground" htmlFor="password">
            Password
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              placeholder="Minimum 8 characters"
              className="mt-2 w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </label>

          {mode === "signup" ? (
            <>
              <fieldset className="space-y-3 rounded-2xl border border-border/60 bg-muted/40 p-4">
                <legend className="px-2 text-sm font-semibold text-foreground">
                  I will use BrightPath as
                </legend>
                {roleOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-2xl border border-transparent p-3 transition",
                      role.value === option.value
                        ? "bg-white/80 shadow-sm"
                        : "hover:bg-white/60",
                    )}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={option.value}
                      checked={role.value === option.value}
                      onChange={() => setRole(option)}
                      className="mt-1 h-4 w-4"
                    />
                    <span>
                      <span className="block text-sm font-semibold text-foreground">
                        {option.label}
                      </span>
                      <span className="text-xs text-foreground/60">{option.description}</span>
                    </span>
                  </label>
                ))}
              </fieldset>

              <label className="block text-sm font-semibold text-foreground" htmlFor="confirm-password">
                Confirm password
                <input
                  id="confirm-password"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="Repeat password"
                  className="mt-2 w-full rounded-2xl border border-border/70 bg-white/70 px-4 py-3 text-sm text-foreground shadow-inner focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
              </label>

              <label className="flex cursor-pointer items-start gap-3 text-xs text-foreground/70">
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-border"
                  checked={consentAccepted}
                  onChange={(event) => setConsentAccepted(event.target.checked)}
                  required
                />
                <span>
                  I agree to BrightPath's privacy promise and confirm I have consent to create this account.
                </span>
              </label>
            </>
          ) : (
            <div className="flex items-center justify-between text-xs text-foreground/60">
              <label className="flex items-center gap-2">
                <input type="checkbox" name="remember" className="h-4 w-4 rounded border-border" />
                Remember me
              </label>
              <Link to="/support" className="font-semibold text-primary hover:underline">
                Need help?
              </Link>
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-full px-4 text-base font-semibold shadow-lg shadow-primary/40"
          >
            {headerCopy.cta}
          </Button>

          <div className="text-center text-xs text-foreground/60">
            {mode === "login" ? (
              <p>
                New to BrightPath?{" "}
                <button
                  type="button"
                  className="font-semibold text-primary hover:underline"
                  onClick={() => setMode("signup")}
                >
                  Create an account
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  className="font-semibold text-primary hover:underline"
                  onClick={() => setMode("login")}
                >
                  Log in here
                </button>
              </p>
            )}
          </div>
        </form>

        <ul className="space-y-3 text-xs text-foreground/65">
          {headerCopy.reassurance.map((item) => (
            <li key={item} className="flex items-start gap-3">
              <Check className="mt-1 h-3.5 w-3.5 text-primary" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function FeatureRow({
  icon: Icon,
  title,
  description,
}: {
  icon: typeof GraduationCap;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/10 p-4">
      <Icon className="mt-1 h-5 w-5" />
      <div>
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-primary-foreground/80">{description}</p>
      </div>
    </div>
  );
}

const authCopy: Record<
  AuthMode,
  {
    title: string;
    subtitle: string;
    cta: string;
    reassurance: string[];
  }
> = {
  login: {
    title: "Log in to continue",
    subtitle: "Access personalized sessions, track progress, and receive emotional insights tailored to your profile.",
    cta: "Log in securely",
    reassurance: [
      "All data encrypted and shared only with trusted supporters.",
      "Session timers and reminders keep practice gentle and consistent.",
      "Switch between student, parent, or teacher views any time.",
    ],
  },
  signup: {
    title: "Create your BrightPath account",
    subtitle: "Set up dyslexia-friendly tools, invite supporters, and receive a calming onboarding experience immediately.",
    cta: "Create account",
    reassurance: [
      "Choose specific accessibility needs during onboarding.",
      "Parents and teachers can co-manage the workspace.",
      "Cancel anytime—your data remains protected.",
    ],
  },
};
