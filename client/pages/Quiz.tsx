import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { UsageLimitDialog } from "@/components/auth/UsageLimitDialog";
import { hasReachedLimit, incrementUsage } from "@/lib/usageLimits";
import { insertQuizAttempt } from "@/lib/supabaseData";
// Get inputText from localStorage (set by ToolsShowcase)

async function fetchQuizFromGroq(text: string) {
  // First validate input
  if (!text || !text.trim()) {
    throw new Error("Please provide text to generate quiz from");
  }

  const prompt = text.trim();

  try {
    const response = await fetch("/api/groq/tools", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: prompt, type: "quiz" }),
    });

    // Parse error response
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Groq tools error:", response.status, errorData);
      throw new Error(errorData?.error || "Failed to generate quiz. Please try again.");
    }

    // Get response data
    const data = await response.json();

    const questions = Array.isArray(data?.questions)
      ? data.questions
      : Array.isArray(data?.fallback?.questions)
        ? data.fallback.questions
        : [];

    // Validate response format
    if (!questions.length) {
      console.error("Invalid quiz format:", data);
      throw new Error(data?.error || "Quiz generation failed. Please try again.");
    }

    // Validate each question has required fields
    for (const q of questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 ||
          typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
        console.error("Invalid question format:", q);
        throw new Error("Quiz format was invalid. Please try again.");
      }
    }

    return questions;
  } catch (err) {
    console.error("Quiz generation error:", err);
    throw err;
  }
}

export default function QuizPage() {
  const [questions, setQuestions] = useState<any[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saveMessageTone, setSaveMessageTone] = useState<"success" | "error" | null>(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const { user } = useAuth();

  const fetchQuiz = async () => {
    setLoading(true);
    setError(null);
    let text = "";
    try {
      text = localStorage.getItem("brightpath.lastInput") || "";
    } catch {}
    if (!text.trim()) {
      setError("Paste or type your text in the box first.");
      setLoading(false);
      return;
    }
    if (!user && hasReachedLimit("quiz")) {
      setLoading(false);
      setLimitDialogOpen(true);
      return;
    }
    try {
      if (!user) {
        incrementUsage("quiz");
      }
      const q = await fetchQuizFromGroq(text);
      setQuestions(q);
    } catch (err: any) {
        console.error("Quiz generation error:", err);
        setError(err?.message || "Failed to generate quiz. Try again.");
    }
    setLoading(false);
  };

  useEffect(() => {
    // Always check current input text first
    const currentText = localStorage.getItem("brightpath.lastInput");
    if (currentText && currentText.trim()) {
      // Generate new quiz if we have current text
      fetchQuiz();
      return;
    }

    // Fall back to saved quiz if no current text
    const savedQuestions = localStorage.getItem("brightpath.lastQuiz");
    if (savedQuestions) {
      try {
        const parsedQuestions = JSON.parse(savedQuestions);
        if (Array.isArray(parsedQuestions)) {
          setQuestions(parsedQuestions);
          return;
        }
      } catch (err) {
        console.error("Failed to parse saved questions:", err);
      }
    }

    // If no saved questions or parsing failed, try fetching new quiz
    fetchQuiz();
    // eslint-disable-next-line
  }, []);

  const handleOptionClick = (idx: number) => {
    setSelected(idx);
  };

  const handleNext = () => {
    if (selected === questions[current].answer) {
      setScore((s) => s + 1);
    }
    setSelected(null);
    if (current < questions.length - 1) {
      setCurrent((c) => c + 1);
    } else {
      setFinished(true);
    }
  };

  if (loading) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8">
        <div className="animate-pulse">Generating quiz questions...</div>
        <p className="text-sm text-muted-foreground mt-2">This may take a few seconds</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8">
        <div className="text-red-500 mb-4">{error}</div>
        <Button onClick={fetchQuiz} variant="outline">Try Again</Button>
      </div>
    );
  }
  
  if (!questions.length) {
    return (
      <div className="max-w-xl mx-auto mt-16 p-8">
        <div className="mb-4">No quiz available. Make sure to:</div>
        <ol className="list-decimal list-inside space-y-2 mb-4">
          <li>Open the text input box</li>
          <li>Paste or type your text</li>
          <li>Click generate quiz</li>
        </ol>
        <Button onClick={fetchQuiz} variant="outline">Generate Quiz</Button>
        <UsageLimitDialog
          open={limitDialogOpen}
          onOpenChange={setLimitDialogOpen}
          featureLabel="AI quiz"
        />
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 rounded-3xl border border-border/70 bg-white/90 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-primary">AI Quiz</h2>
      <Button 
        onClick={() => {
          // Clear saved quiz so it generates from current text
          localStorage.removeItem("brightpath.lastQuiz");
          fetchQuiz();
        }} 
        className="mb-4"
      >
        Regenerate Quiz
      </Button>
      {finished ? (
        <div className="text-center space-y-4">
          <p className="text-lg font-semibold">Quiz finished!</p>
          <p className="text-base">Your score: {score} / {questions.length}</p>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            <Button onClick={async () => {
              // Save to quiz history
              try {
                const quizHistory = JSON.parse(localStorage.getItem("brightpath.quizHistory") || "[]");
                const text = localStorage.getItem("brightpath.lastInput") || "";
                const item = {
                  id: Date.now().toString(),
                  questions,
                  score,
                  totalQuestions: questions.length,
                  text: text.slice(0, 100) + "...", // Preview of text
                  createdAt: Date.now()
                };
                quizHistory.push(item);
                localStorage.setItem("brightpath.quizHistory", JSON.stringify(quizHistory));
                if (user?.id) {
                  await insertQuizAttempt(user.id, {
                    questions,
                    score,
                    totalQuestions: questions.length,
                    text,
                    createdAt: item.createdAt,
                  });
                }
                setSaveMessage("Quiz saved to history.");
                setSaveMessageTone("success");
                setTimeout(() => setSaveMessage(null), 2200);
              } catch (err) {
                console.error("Failed to save quiz:", err);
                setSaveMessage("Could not save quiz.");
                setSaveMessageTone("error");
                setTimeout(() => setSaveMessage(null), 2200);
              }
            }} variant="outline">Save to History</Button>
            <Button onClick={() => {
              setCurrent(0);
              setScore(0);
              setFinished(false);
              setSelected(null);
            }} variant="default">Retake Quiz</Button>
            <Button onClick={() => {
              window.location.href = "/tools";
            }} variant="secondary">Back to Tools</Button>
          </div>
          {saveMessage ? (
            <div className={`mt-3 text-xs ${saveMessageTone === "error" ? "text-red-500" : "text-emerald-600"}`}>
              {saveMessage}
            </div>
          ) : null}
        </div>
      ) : (
        <div>
          <p className="text-lg font-medium mb-4">{questions[current].question}</p>
          <div className="space-y-2 mb-6">
            {questions[current].options.map((opt: string, idx: number) => (
              <button
                key={idx}
                className={`w-full text-left px-4 py-2 rounded-lg border border-border/60 bg-muted/40 hover:bg-primary/10 ${selected === idx ? "border-primary bg-primary/20" : ""}`}
                onClick={() => handleOptionClick(idx)}
                disabled={selected !== null}
              >
                {opt}
              </button>
            ))}
          </div>
          <button
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow"
            onClick={handleNext}
            disabled={selected === null}
          >
            {current < questions.length - 1 ? "Next" : "Finish"}
          </button>
        </div>
      )}
      <UsageLimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        featureLabel="AI quiz"
      />
    </div>
  );
}
