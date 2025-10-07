import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type RecognitionInstance = {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
};

type UseSpeechRecognitionOptions = {
  lang?: string;
};

type SpeechRecognitionConstructor = new () => RecognitionInstance;

export function useSpeechRecognition(options: UseSpeechRecognitionOptions = {}) {
  const { lang = "en-US" } = options;
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);

  const Recognition = useMemo<SpeechRecognitionConstructor | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }
    const withWindow = window as typeof window & {
      webkitSpeechRecognition?: SpeechRecognitionConstructor;
      SpeechRecognition?: SpeechRecognitionConstructor;
    };
    return withWindow.SpeechRecognition ?? withWindow.webkitSpeechRecognition ?? null;
  }, []);

  const recognitionRef = useRef<RecognitionInstance | null>(null);

  useEffect(() => {
    if (!Recognition) {
      return;
    }

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;

    recognition.onresult = (event: any) => {
      const results = Array.from(event.results)
        .map((result: any) => result[0]?.transcript ?? "")
        .join(" ");
      setTranscript(results.trim());
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      recognition.stop();
    };
  }, [Recognition, lang]);

  const start = useCallback(() => {
    if (!recognitionRef.current) {
      return false;
    }
    try {
      setTranscript("");
      recognitionRef.current.start();
      setIsListening(true);
      return true;
    } catch (error) {
      setIsListening(false);
      return false;
    }
  }, []);

  const stop = useCallback(() => {
    if (!recognitionRef.current) {
      return;
    }
    recognitionRef.current.stop();
    setIsListening(false);
  }, []);

  return {
    supported: Boolean(Recognition),
    transcript,
    isListening,
    start,
    stop,
    setTranscript,
  };
}
