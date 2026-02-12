import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { HistoryItem, QuizHistoryItem } from "@/lib/utils";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizHistoryItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("brightpath.history");
      if (raw) setItems(JSON.parse(raw));

      const quizRaw = localStorage.getItem("brightpath.quizHistory");
      if (quizRaw) setQuizzes(JSON.parse(quizRaw));
    } catch {
      setItems([]);
      setQuizzes([]);
    }
  }, []);

  const handleRetakeQuiz = (quiz: QuizHistoryItem) => {
    // Clear any existing quiz state first
    localStorage.removeItem("brightpath.lastQuiz");
    localStorage.removeItem("brightpath.lastInput");
    
    // Save the text and questions for the quiz page
    localStorage.setItem("brightpath.lastInput", quiz.text);
    if (Array.isArray(quiz.questions)) {
      localStorage.setItem("brightpath.lastQuiz", JSON.stringify(quiz.questions));
    }
    // Navigate to quiz page
    window.location.href = "/quiz";
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-4">
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Saved Quizzes</h2>
        {quizzes.length === 0 ? (
          <p className="text-sm text-foreground/70">No saved quizzes yet. Complete and save a quiz to see it here.</p>
        ) : (
          <ul className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {quizzes
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((quiz) => (
                <li key={quiz.id} className="rounded-2xl border border-border/70 bg-white/90 p-6 shadow-sm">
                  <div className="flex justify-between items-start mb-3">
                    <p className="text-xs text-foreground/60">
                      {new Date(quiz.createdAt).toLocaleString()}
                    </p>
                    <span className="text-sm font-medium text-primary">
                      Score: {quiz.score}/{quiz.totalQuestions}
                    </span>
                  </div>
                  <p className="text-sm text-foreground/80 mb-4 line-clamp-3">{quiz.text}</p>
                  <Button
                    onClick={() => handleRetakeQuiz(quiz)}
                    variant="outline"
                    size="sm"
                  >
                    Retake Quiz
                  </Button>
                </li>
              ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Canvas History</h2>
        {items.length === 0 ? (
          <p className="text-sm text-foreground/70">No saved items yet. Export from Tools to add entries.</p>
        ) : (
          <ul className="space-y-4">
            {items
              .sort((a, b) => b.createdAt - a.createdAt)
              .map((item) => (
                <li key={item.id} className="rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm">
                  <p className="text-xs text-foreground/60">
                    {new Date(item.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-2 whitespace-pre-wrap text-sm text-foreground/80">{item.content}</p>
                  {item.summary ? (
                    <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-foreground/80 whitespace-pre-line">
                      <p className="text-xs font-semibold text-foreground/60">Summary</p>
                      <p className="mt-1">{item.summary}</p>
                    </div>
                  ) : null}
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}


