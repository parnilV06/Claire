import { useRef, useState } from "react";

export function useSarvamTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function speak(text: string) {
    setIsSpeaking(true);
    setAudioUrl(null);
    const apiKey = import.meta.env.VITE_SARVAM_API_KEY;
    try {
      const response = await fetch("https://api.sarvam.ai/text-to-speech", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "api-subscription-key": apiKey ?? "",
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("TTS request failed");
      const data = await response.json();
      let audioDataUrl: string | null = null;
      if (Array.isArray(data?.audios) && data.audios.length > 0) {
        audioDataUrl = `data:audio/wav;base64,${data.audios[0]}`;
      } else if (data?.audioUrl) {
        audioDataUrl = data.audioUrl;
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
