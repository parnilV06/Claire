import { useState } from "react";

export function useSarvamTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  async function speak(text: string) {
    setIsSpeaking(true);
    setAudioUrl(null);
    try {
      const response = await fetch("https://api.sarvam.ai/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.REACT_APP_SARVAM_API_KEY}`,
        },
        body: JSON.stringify({ text }),
      });
      if (!response.ok) throw new Error("TTS request failed");
      const data = await response.json();
      setAudioUrl(data.audioUrl);
      const audio = new Audio(data.audioUrl);
      audio.onended = () => setIsSpeaking(false);
      audio.onerror = () => setIsSpeaking(false);
      audio.play();
    } catch (err) {
      setIsSpeaking(false);
    }
  }

  function cancel() {
    setIsSpeaking(false);
    setAudioUrl(null);
  }

  return { isSpeaking, speak, cancel, audioUrl };
}
