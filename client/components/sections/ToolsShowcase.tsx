import { ChangeEvent, useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";
import { Download, Mic, MicOff, Play, Sparkles, StopCircle, Upload, Maximize2, Minimize2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UsageLimitDialog } from "@/components/auth/UsageLimitDialog";
import { hasReachedLimit, incrementUsage, UsageFeature } from "@/lib/usageLimits";
import { insertSummary } from "@/lib/supabaseData";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useSpeechSynthesis } from "@/hooks/useSpeechSynthesis";
import { cn } from "@/lib/utils";

const backgroundPalettes = [
  { id: "calm-blue", label: "Calm blue", value: "#E4F4FF" },
  { id: "soft-ivory", label: "Soft ivory", value: "#FDF6EC" },
  { id: "sage-mist", label: "Sage mist", value: "#EAF7F1" },
  { id: "dusk-lavender", label: "Dusk lavender", value: "#F1ECFF" },
];

const complexToSimpleMap: Record<string, string> = {
  comprehend: "understand",
  assistance: "help",
  collaboration: "teamwork",
  communicate: "share",
  accomplish: "complete",
  demonstrate: "show",
  initiate: "start",
  conclude: "finish",
  terminate: "end",
  utilize: "use",
  facilitate: "support",
  implement: "do",
  establish: "set",
  substantial: "big",
  complexity: "difficulty",
  methodology: "method",
  cognition: "thinking",
  equilibrium: "balance",
  alleviate: "ease",
};

const defaultText =
  "Claire helps me break big reading tasks into calming steps. It reminds me to breathe, adjust my font and spacing, and listen while I follow along.";

export function ToolsShowcase() {
  // Single shared TTS hook (handles Sarvam API or browser fallback)
  const tts = useSpeechSynthesis();

  // AI Mind Map Image
  const [mindMapImageUrl, setMindMapImageUrl] = useState<string | null>(null);
  const generateMindMapImage = async () => {
    // Replace with your AI image API call
    // Example: POST to /api/generate-mindmap-image with mindMap data
    setMindMapImageUrl("https://via.placeholder.com/400x200?text=AI+Mind+Map");
  };

  // AI Dyslexia-Friendly Summary
  const [aiSummary, setAISummary] = useState<string>("");
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [summarySavedMessage, setSummarySavedMessage] = useState<string | null>(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [limitFeatureLabel, setLimitFeatureLabel] = useState<string>("feature");
  const generateAISummary = async (text?: string) => {
    const summaryText = text ?? inputText;
    if (!summaryText.trim()) {
      setAISummary("");
      setSummaryError("Paste or type your text first.");
      return;
    }

    setSummaryLoading(true);
    setSummaryError(null);
    try {
      const response = await fetch("/api/groq/tools", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: summaryText, type: "summary" }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data) {
        throw new Error(data?.error || "Failed to generate summary. Please try again.");
      }

      if (data.success && typeof data.summary === "string") {
        setAISummary(data.summary);
        return;
      }

      if (data?.fallback?.summary) {
        setAISummary(data.fallback.summary);
        setSummaryError(data?.error || "Showing a fallback summary.");
        return;
      }

      throw new Error(data?.error || "Summary generation failed.");
    } catch (err: any) {
      console.error("[ToolsShowcase] Summary generation error:", err);
      setSummaryError(err?.message || "Summary generation failed. Please try again.");
    } finally {
      setSummaryLoading(false);
    }
  };
  const [inputText, setInputText] = useState(defaultText);
  const [simplifiedText, setSimplifiedText] = useState("");
  const [fontSize, setFontSize] = useState(20);
  const [letterSpacing, setLetterSpacing] = useState(0.08);
  const [wordSpacing, setWordSpacing] = useState(0.25);
  const [lineSpacing, setLineSpacing] = useState(1.7);
  const [backgroundColor, setBackgroundColor] = useState(backgroundPalettes[0]);
  const [useOpenDyslexic, setUseOpenDyslexic] = useState(true);
  const [speechRate, setSpeechRate] = useState(0.95);
  const [summary, setSummary] = useState<string[]>([]);
  const [mindMap, setMindMap] = useState<MindMapNode[]>([]);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const [sarvamVoice, setSarvamVoice] = useState<string>("anushka");
  // Remove browser TTS state

  // expose helpers from the single hook
  const { speak: sarvamSpeak, cancel: sarvamPause, isSpeaking: isSarvamSpeaking, audioUrl: sarvamAudioUrl } = tts;
  const { speak, cancel, isSpeaking, audioUrl } = tts;
  const {
    supported: recognitionSupported,
    transcript,
    isListening,
    start,
    stop,
    setTranscript,
  } = useSpeechRecognition();
  const { user } = useAuth();

  useEffect(() => {
    setSimplifiedText(simplifyText(inputText));
    setSummary(generateSummary(inputText));
    setMindMap(createMindMap(inputText));
    try {
      localStorage.setItem("Claire.lastInput", inputText);
    } catch {}
  }, [inputText]);

  useEffect(() => {
    if (!transcript) {
      return;
    }
    setInputText((prev) => {
      if (!prev.trim()) {
        return transcript;
      }
      return `${prev.trim()} ${transcript}`.trim();
    });
  }, [transcript]);

  const formattedStyles = useMemo(() => {
    return {
      fontSize: `${fontSize}px`,
      letterSpacing: `${letterSpacing}em`,
      wordSpacing: `${wordSpacing}em`,
      backgroundColor: backgroundColor.value,
      fontFamily: useOpenDyslexic ? "Open-Dyslexic, Inter, sans-serif" : "Inter, sans-serif",
      lineHeight: lineSpacing,
      padding: "1.5rem",
      borderRadius: "1.25rem",
      transition: "all 0.2s ease",
    } as CSSProperties;
  }, [backgroundColor.value, fontSize, letterSpacing, useOpenDyslexic, wordSpacing, lineSpacing]);

  const handleUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (file.type.startsWith("text") || file.type === "application/json") {
      const content = await file.text();
      setInputText(content.slice(0, 4000));
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        const text = typeof reader.result === "string" ? reader.result : "";
        setInputText(text.slice(0, 4000));
      };
      reader.readAsText(file);
    }
  };

  const exportText = () => {
    const blob = new Blob([inputText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "claire-notes.txt";
    link.click();
    URL.revokeObjectURL(url);
  };

  // Simple TTS with word highlighting using Web Speech API
  const previewText = simplifiedText || inputText;

  const handleSpeak = () => {
    speak(inputText);
  };

  const toggleRecognition = () => {
    if (isListening) {
      stop();
      return;
    }
    setTranscript("");
    start();
  };

  const handleLimitedAction = (feature: UsageFeature, label: string, action: () => void) => {
    if (user) {
      action();
      return;
    }

    if (hasReachedLimit(feature)) {
      setLimitFeatureLabel(label);
      setLimitDialogOpen(true);
      return;
    }

    incrementUsage(feature);
    action();
  };

  const handleSaveSummaryToHistory = async () => {
    if (!inputText.trim()) {
      setSummaryError("Paste or type your text first.");
      return;
    }
    if (!aiSummary.trim()) {
      setSummaryError("Generate a summary before saving.");
      return;
    }

    try {
      const raw = localStorage.getItem("brightpath.history");
      const list = raw ? (JSON.parse(raw) as Array<any>) : [];
      const item = {
        id: crypto.randomUUID(),
        content: inputText,
        summary: aiSummary,
        createdAt: Date.now(),
      };
      localStorage.setItem("brightpath.history", JSON.stringify([item, ...list]));
      if (user?.id) {
        await insertSummary(user.id, {
          sourceText: inputText,
          summaryText: aiSummary,
          createdAt: item.createdAt,
        });
      }
      setSummaryError(null);
      setSummarySavedMessage("Saved to history.");
      setTimeout(() => setSummarySavedMessage(null), 2200);
    } catch (err) {
      console.error("[ToolsShowcase] Failed to save summary:", err);
      setSummaryError("Could not save summary. Please try again.");
    }
  };

  return (
    <section className="mt-24 space-y-12" id="tools">
      <div className="space-y-4 text-center">
        <span className="inline-flex items-center justify-center rounded-full bg-primary/15 px-4 py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          Personalized learning tools
        </span>
        <h2 className="text-3xl font-semibold text-foreground sm:text-4xl">
          Calming workspace with adaptive accessibility
        </h2>
        <p className="mx-auto max-w-3xl text-base text-foreground/75 sm:text-lg">
          Adjust fonts, simplify complex passages, narrate aloud, or speak your notes. Our AI copilots summarize key ideas and transform notes into visual mind maps for deeper retention.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        {/* Left controls sidebar */}
        <div className="flex flex-col gap-4 rounded-3xl border border-border/70 bg-white/80 p-6 shadow-lg backdrop-blur-sm">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-lg font-semibold text-foreground">Reading tools</p>
            <div className="flex flex-wrap gap-2">
              <label className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-border"
                  checked={useOpenDyslexic}
                  onChange={(event) => setUseOpenDyslexic(event.target.checked)}
                />
                Open Dyslexic font
              </label>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
              <label className="text-sm font-medium text-foreground/80" htmlFor="font-size">
                Font size
              </label>
              <input
                id="font-size"
                type="range"
                min={16}
                max={28}
                value={fontSize}
                onChange={(event) => setFontSize(Number(event.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
              <label className="text-sm font-medium text-foreground/80" htmlFor="letter-spacing">
                Letter spacing
              </label>
              <input
                id="letter-spacing"
                type="range"
                min={0}
                max={0.2}
                step={0.01}
                value={letterSpacing}
                onChange={(event) => setLetterSpacing(Number(event.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
              <label className="text-sm font-medium text-foreground/80" htmlFor="word-spacing">
                Word spacing
              </label>
              <input
                id="word-spacing"
                type="range"
                min={0}
                max={0.4}
                step={0.02}
                value={wordSpacing}
                onChange={(event) => setWordSpacing(Number(event.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
              <label className="text-sm font-medium text-foreground/80" htmlFor="line-spacing">
                Line spacing
              </label>
              <input
                id="line-spacing"
                type="range"
                min={1.2}
                max={2.2}
                step={0.05}
                value={lineSpacing}
                onChange={(event) => setLineSpacing(Number(event.target.value))}
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-muted/60 p-4">
              <span className="text-sm font-medium text-foreground/80">Background</span>
              <div className="flex gap-2">
                {backgroundPalettes.map((palette) => (
                  <button
                    key={palette.id}
                    type="button"
                    className={cn(
                      "h-8 w-8 rounded-full border-2 border-border/40",
                      backgroundColor.id === palette.id && "border-primary scale-110",
                    )}
                    style={{ backgroundColor: palette.value }}
                    onClick={() => setBackgroundColor(palette)}
                    aria-label={palette.label}
                  />
                ))}
              </div>
            </div>
            <label className="inline-flex cursor-pointer items-center gap-3 rounded-full border border-border/60 bg-white/70 px-4 py-2 text-sm font-medium text-foreground/80 shadow-sm">
              <Upload className="h-4 w-4 text-primary" />
              Upload text file
              <input
                type="file"
                className="hidden"
                accept=".txt,.md,.json,.rtf,.pdf"
                onChange={handleUpload}
              />
            </label>
            <div className="flex flex-col gap-2 mt-4">
              <label className="text-sm font-medium text-foreground/80">Voice</label>
              <div className="flex items-center gap-2">
                <select
                  value={sarvamVoice}
                  onChange={e => setSarvamVoice(e.target.value)}
                  className="rounded-md border border-border/60 bg-white/80 p-2 text-sm font-medium text-foreground/80"
                  aria-label="Select voice"
                  disabled
                  style={{ minWidth: 120 }}
                >
                  <option value="anushka">Anushka (default)</option>
                </select>
                <span className="text-xs text-muted-foreground ml-2">More voices coming soon</span>
              </div>
              <div className="flex gap-2 mt-2">
                {isSarvamSpeaking ? (
                  <button
                    type="button"
                    className="rounded-md border border-border/60 bg-red-100 p-2 text-red-500 shadow-sm hover:bg-red-200"
                    onClick={() => sarvamPause()}
                    aria-label="Pause TTS"
                  >
                    <StopCircle className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    className="rounded-md border border-border/60 bg-primary/10 p-2 text-primary shadow-sm hover:bg-primary/20"
                    onClick={() =>
                      handleLimitedAction("tts", "text-to-speech", () =>
                        sarvamSpeak(previewText, { speaker: sarvamVoice }),
                      )
                    }
                    aria-label="Play with Sarvam AI TTS"
                  >
                    <Sparkles className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Right windowed preview and insights */}
        <aside className="flex flex-col gap-6">
          {/* Text input */}
          <textarea
            value={inputText}
            onChange={(event) => setInputText(event.target.value)}
            placeholder="Paste or type content here..."
            className="h-40 w-full rounded-2xl border border-border/70 bg-white/60 p-4 text-base text-foreground shadow-inner focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <article className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
            <div className="relative">
              <button
                type="button"
                aria-label={isPreviewFullscreen ? "Exit full screen" : "Enter full screen"}
                className="absolute right-0 top-0 rounded-md border border-border/60 bg-white/80 p-2 text-foreground/70 shadow-sm hover:bg-white"
                onClick={() => setIsPreviewFullscreen((v) => !v)}
              >
                {isPreviewFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
              </button>
            </div>
            <div
              style={{ ...formattedStyles, maxHeight: '180px' }}
              className="mx-auto w-full max-w-3xl overflow-auto text-base text-foreground"
              tabIndex={0}
            >
              {previewText}
            </div>
          </article>
          <article className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-foreground">AI Quiz</h3>
            <p className="mt-2 text-sm text-foreground/70">
              Test your understanding with a dyslexia-friendly quiz. Questions are short and clear.
            </p>
            <div className="mt-6 flex gap-4">
              <button
                type="button"
                className="rounded-md border border-border/60 bg-primary/10 px-4 py-2 text-primary font-medium shadow-sm hover:bg-primary/20"
                onClick={() => {
                  handleLimitedAction("quiz", "AI quiz", () => {
                    // Clear any existing quiz
                    localStorage.removeItem("brightpath.lastQuiz");
                    // Save current text
                    localStorage.setItem("brightpath.lastInput", inputText);
                    // Navigate to quiz
                    window.location.href = "/quiz";
                  });
                }}
              >
                Start AI Quiz
              </button>
            </div>
          </article>
          <article className="rounded-3xl border border-border/70 bg-gradient-to-br from-secondary/40 via-white/80 to-accent/30 p-6 shadow-lg backdrop-blur-sm">
            <div className="flex flex-wrap gap-4">
              <button
                type="button"
                className="rounded-md border border-border/60 bg-accent/20 px-4 py-2 text-primary font-medium shadow-sm hover:bg-accent/50 disabled:opacity-60"
                onClick={() => handleLimitedAction("summary", "AI summary", () => generateAISummary(inputText))}
                disabled={summaryLoading}
              >
                {summaryLoading ? "Generating summary..." : "Generate Dyslexia-Friendly AI Summary"}
              </button>
              <button
                type="button"
                className="rounded-md border border-border/60 bg-white/80 px-4 py-2 text-foreground/80 font-medium shadow-sm hover:bg-muted/40 disabled:opacity-60"
                onClick={handleSaveSummaryToHistory}
                disabled={summaryLoading}
              >
                Save summary to history
              </button>
            </div>
            {summarySavedMessage ? (
              <div className="mt-2 text-xs text-emerald-600">{summarySavedMessage}</div>
            ) : null}
            {summaryError && (
              <div className="mt-3 rounded-xl border border-border/60 bg-white/80 p-3 text-sm text-red-500 max-w-md">
                {summaryError}
              </div>
            )}
            {aiSummary && (
              <div className="mt-3 rounded-xl border border-border/60 bg-white/80 p-4 text-base text-foreground max-w-md whitespace-pre-line">
                {aiSummary}
              </div>
            )}
          </article>
        </aside>
      </div>
      {isPreviewFullscreen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="relative w-full max-w-5xl rounded-2xl border border-border/70 bg-white shadow-2xl">
            <button
              type="button"
              aria-label="Exit full screen"
              className="absolute right-3 top-3 rounded-md border border-border/60 bg-white/90 p-2 text-foreground/70 shadow-sm hover:bg-white"
              onClick={() => setIsPreviewFullscreen(false)}
            >
              <Minimize2 className="h-4 w-4" />
            </button>
            <div className="absolute left-3 top-3">
              <button
                type="button"
                className="rounded-md border border-border/60 bg-white/90 p-2 text-primary shadow-sm hover:bg-primary/10"
                onClick={() => handleLimitedAction("tts", "text-to-speech", () => sarvamSpeak(previewText))}
                disabled={isSarvamSpeaking}
                aria-label="Play with Sarvam AI TTS"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
            <div style={formattedStyles} className="m-6 max-h-[80vh] overflow-auto text-base text-foreground">
              {previewText}
            </div>
          </div>
        </div>
      ) : null}
      <UsageLimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        featureLabel={limitFeatureLabel}
      />
    </section>
  );
}

type MindMapNode = {
  topic: string;
  children: string[];
};

function simplifyText(text: string) {
  return text
    .split(/(\b)/)
    .map((segment) => {
      const key = segment.toLowerCase();
      return complexToSimpleMap[key] ?? segment;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

function generateSummary(text: string) {
  if (!text.trim()) {
    return [];
  }
  const sentences = text
    .replace(/\n+/g, " ")
    .split(/[.!?]/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);

  if (sentences.length === 0) {
    return [];
  }

  const insights = sentences.slice(0, 3);
  if (sentences.length > 3) {
    insights.push("Encourage reflection or action based on the final idea.");
  }
  return insights;
}

function createMindMap(text: string): MindMapNode[] {
  if (!text.trim()) {
    return [];
  }
  const words = text
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((word) => word.length > 3);

  const frequency = new Map<string, number>();
  for (const word of words) {
    frequency.set(word, (frequency.get(word) ?? 0) + 1);
  }

  const topics = Array.from(frequency.entries())
    .filter(([word]) => !stopWords.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);

  return topics.map((topic) => {
    const related = words
      .filter((word) => word !== topic && !stopWords.has(word))
      .filter((word, index, array) => array.indexOf(word) === index)
      .slice(0, 6);

    return {
      topic,
      children: related.length > 0 ? related : ["Add your own ideas"],
    };
  });
}

const stopWords = new Set([
  "with",
  "this",
  "that",
  "have",
  "from",
  "they",
  "them",
  "there",
  "their",
  "about",
  "into",
  "while",
  "where",
  "could",
  "would",
  "should",
  "along",
  "over",
  "these",
  "those",
]);
