import { TherapySupportSection } from "@/components/sections/TherapySupportSection";
import { OpenRouterChat } from "@/components/support/OpenRouterChat";
import TraceVoiceCard from "@/components/support/TraceVoiceCard";
import TherapistReferral from "@/components/support/TherapistReferral";

export default function SupportPage() {
  return (
    <div className="space-y-24">
      <TherapySupportSection />
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">AI Support Chat</h2>
        <OpenRouterChat />
      </section>
      <section className="mt-8">
        <h2 className="mb-4 text-2xl font-semibold">More support options</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <TraceVoiceCard />
          <TherapistReferral />
        </div>
      </section>
    </div>
  );
}


