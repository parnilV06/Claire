import { TherapySupportSection } from "@/components/sections/TherapySupportSection";
import { OpenRouterChat } from "@/components/support/OpenRouterChat";

export default function SupportPage() {
  return (
    <div className="space-y-24">
      <TherapySupportSection />
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">AI Support Chat</h2>
        <OpenRouterChat />
      </section>
    </div>
  );
}


