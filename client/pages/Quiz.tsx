import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
// Get inputText from localStorage (set by ToolsShowcase)

async function fetchQuizFromSarvam(text: string) {
  // First validate input
  if (!text || !text.trim()) {
    throw new Error("Please provide text to generate quiz from");
  }

  const prompt = text.trim();

  try {
    const response = await fetch(`/api/sarvam/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ prompt }),
    });

    // Parse error response
    if (!response.ok) {
      const errorData = await response.json().catch(() => null);
      console.error("Sarvam proxy error:", response.status, errorData);
      throw new Error(errorData?.error || "Failed to generate quiz. Please try again.");
    }

    // Get response data
    const data = await response.json();

    // Validate response format
    if (!data || !Array.isArray(data.questions) || data.questions.length === 0) {
      console.error("Invalid quiz format:", data);
      throw new Error("Quiz generation failed. Please try again.");
    }

    // Validate each question has required fields
    for (const q of data.questions) {
      if (!q.question || !Array.isArray(q.options) || q.options.length !== 4 || 
          typeof q.answer !== 'number' || q.answer < 0 || q.answer > 3) {
        console.error("Invalid question format:", q);
        throw new Error("Quiz format was invalid. Please try again.");
      }
    }

    return data.questions;
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
    try {
      const q = await fetchQuizFromSarvam(text);
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
          <div className="flex justify-center gap-4 mt-4">
            <Button onClick={() => {
              // Save to quiz history
              try {
                const quizHistory = JSON.parse(localStorage.getItem("brightpath.quizHistory") || "[]");
                const text = localStorage.getItem("brightpath.lastInput") || "";
                quizHistory.push({
                  id: Date.now().toString(),
                  questions,
                  score,
                  totalQuestions: questions.length,
                  text: text.slice(0, 100) + "...", // Preview of text
                  createdAt: Date.now()
                });
                localStorage.setItem("brightpath.quizHistory", JSON.stringify(quizHistory));
              } catch (err) {
                console.error("Failed to save quiz:", err);
              }
            }} variant="outline">Save to History</Button>
            <Button onClick={() => {
              setCurrent(0);
              setScore(0);
              setFinished(false);
              setSelected(null);
            }} variant="default">Retake Quiz</Button>
          </div>
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
    </div>
  );
}
