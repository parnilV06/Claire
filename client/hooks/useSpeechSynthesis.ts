
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
    const chunks = splitText(text);

    for (let i = 0; i < chunks.length; i++) {
      if (cancelRequested.current) break;
      try {
        // Proxy through our server-side endpoint so the API key stays secret in production
        let response = await fetch(`/api/sarvam/tts`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text: chunks[i],
            target_language_code: options.target_language_code || "en-IN",
            speaker: options.speaker || "anushka",
          }),
        });

        if (!response.ok) {
          const errText = await response.text().catch(() => "");
          throw new Error(`TTS proxy failed ${response.status} ${errText}`);
        }

        // Handle JSON or binary responses from the proxy (proxy forwards Sarvam response)
        const contentType = response.headers.get("content-type") || "";
        let audioDataUrl: string | null = null;
        if (contentType.includes("application/json")) {
          const data = await response.json();
          if (Array.isArray(data?.audios) && data.audios.length > 0) {
            audioDataUrl = `data:audio/wav;base64,${data.audios[0]}`;
          } else if (data?.audioUrl) {
            audioDataUrl = data.audioUrl;
          } else if (data?.audio) {
            audioDataUrl = `data:audio/wav;base64,${data.audio}`;
          }
        } else if (contentType.startsWith("audio/")) {
          const blob = await response.blob();
          audioDataUrl = URL.createObjectURL(blob);
        } else {
          try {
            const data = await response.json();
            if (Array.isArray(data?.audios) && data.audios.length > 0) {
              audioDataUrl = `data:audio/wav;base64,${data.audios[0]}`;
            } else if (data?.audioUrl) {
              audioDataUrl = data.audioUrl;
            }
          } catch (err) {
            console.warn("Unknown proxy response shape", err);
          }
        }
        setAudioUrl(audioDataUrl);
        if (audioDataUrl) {
          await new Promise((resolve, reject) => {
            const audio = new Audio(audioDataUrl);
            audioRefs.current.push(audio);
            audio.onended = resolve;
            audio.onerror = (e) => {
              console.error("Audio playback error", e);
              reject(e);
            };
            audio.play().catch((e) => {
              console.error("Audio play() failed", e);
              reject(e);
            });
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
