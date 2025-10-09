
import { useRef, useState } from "react";

type SpeakOptions = {
  target_language_code?: string;
  speaker?: string;
};

export function useSpeechSynthesis() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  // Helper: Split text into chunks (max 250 chars, split by sentence)
  function splitText(text: string, maxLen = 250): string[] {
    const sentences = text.match(/[^.!?]+[.!?]?/g) || [];
    const chunks: string[] = [];
    let current = "";
    for (const sentence of sentences) {
      if ((current + sentence).length > maxLen && current) {
        chunks.push(current.trim());
        current = "";
      }
      current += sentence;
    }
    if (current.trim()) chunks.push(current.trim());
    return chunks;
  }

  // Play chunks sequentially, support cancel. Use refs so values persist across renders.
  const audioRefs = useRef<HTMLAudioElement[]>([]);
  const cancelRequested = useRef(false);

  const speak = async (text: string, options: SpeakOptions = {}) => {
    setIsSpeaking(true);
    setAudioUrl(null);
    cancelRequested.current = false;
    audioRefs.current.length = 0;
    const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
    const chunks = splitText(text);

    // Require Sarvam API key to use Sarvam TTS
    if (!apiKey) {
      console.error("VITE_SARVAM_API_KEY is not set. Sarvam TTS requires an API key.");
      setIsSpeaking(false);
      return;
    }

    for (let i = 0; i < chunks.length; i++) {
      if (cancelRequested.current) break;
      try {
        const response = await fetch("https://api.sarvam.ai/text-to-speech", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "api-subscription-key": apiKey ?? "",
          },
          body: JSON.stringify({
            text: chunks[i],
            target_language_code: options.target_language_code || "en-IN",
            speaker: options.speaker || "anushka"
          }),
        });
        if (!response.ok) throw new Error("TTS request failed");
        const data = await response.json();
        let audioDataUrl = null;
        if (Array.isArray(data?.audios) && data.audios.length > 0) {
          const base64 = data.audios[0];
          audioDataUrl = `data:audio/wav;base64,${base64}`;
        }
        setAudioUrl(audioDataUrl);
        if (audioDataUrl) {
          await new Promise((resolve, reject) => {
            const audio = new Audio(audioDataUrl);
            audioRefs.current.push(audio);
            audio.onended = resolve;
            audio.onerror = reject;
            audio.play();
          });
        }
      } catch (err) {
        console.error("Sarvam TTS error:", err);
        break;
      }
    }
    setIsSpeaking(false);
    audioRefs.current.length = 0;
  };

  const cancel = () => {
    cancelRequested.current = true;
    audioRefs.current.forEach(audio => {
      try {
        audio.pause();
        audio.currentTime = 0;
      } catch {}
    });
    audioRefs.current.length = 0;
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      try { window.speechSynthesis.cancel(); } catch {}
    }
    setIsSpeaking(false);
    setAudioUrl(null);
  };

  return {
    isSpeaking,
    speak,
    cancel,
    audioUrl,
  };
}
