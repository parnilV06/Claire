import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
type ComingSoonProps = {
  title: string;
  description: string;
  tips?: string[];
};

export function ComingSoon({ title, description, tips = [] }: ComingSoonProps) {
  const { speak, isSpeaking } = useSpeechSynthesis();
  return (
    <section className="mx-auto flex max-w-3xl flex-col gap-6 rounded-3xl border border-border/70 bg-white/80 p-10 text-center shadow-lg backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-full border border-border bg-white p-2 text-primary hover:bg-primary/10 focus:outline-none"
          aria-label="Play description"
          onClick={() => speak(description)}
          disabled={isSpeaking}
        >
          <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" fill="currentColor"/></svg>
        </button>
      </div>
      <p className="text-base leading-7 text-foreground/70 sm:text-lg">{description}</p>
      {tips.length > 0 ? (
        <ul className="mx-auto max-w-xl space-y-2 text-left text-sm text-foreground/75">
          {tips.map((tip) => (
            <li key={tip} className="flex items-start gap-3 rounded-2xl bg-muted/60 p-4">
              <span className="mt-1 inline-flex h-2 w-2 rounded-full bg-primary" aria-hidden />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
