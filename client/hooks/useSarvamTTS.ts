import { useRef, useState } from "react";

export function useSarvamTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function speak(text: string) {
    setIsSpeaking(true);
    setAudioUrl(null);
    try {
      const response = await fetch("/api/sarvam/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        throw new Error(`TTS request failed: ${errorText}`);
      }

      // Handle different response types from the proxy
      const contentType = response.headers.get("content-type") || "";
      let audioDataUrl: string | null = null;

      if (contentType.includes("application/json")) {
        const data = await response.json();
        if (Array.isArray(data?.audios) && data.audios.length > 0) {
          audioDataUrl = `data:audio/wav;base64,${data.audios[0]}`;
        } else if (data?.audioUrl) {
          audioDataUrl = data.audioUrl;
        }
      } else if (contentType.startsWith("audio/")) {
        // Binary audio response
        const arrayBuffer = await response.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        audioDataUrl = `data:${contentType};base64,${base64}`;
      }
      setAudioUrl(audioDataUrl);
      if (audioDataUrl) {
        audioRef.current = new Audio(audioDataUrl);
        audioRef.current.onended = () => setIsSpeaking(false);
        audioRef.current.onerror = () => setIsSpeaking(false);
        await audioRef.current.play();
      } else {
        setIsSpeaking(false);
      }
    } catch (err) {
      console.error('useSarvamTTS error', err);
      setIsSpeaking(false);
    }
  }

  function cancel() {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current = null;
      }
    } catch {}
    setIsSpeaking(false);
    setAudioUrl(null);
  }

  return { isSpeaking, speak, cancel, audioUrl };
}
