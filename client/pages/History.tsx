import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchCanvasEntries, fetchQuizAttempts, fetchSummaries } from "@/lib/supabaseData";
import { HistoryItem, QuizHistoryItem } from "@/lib/utils";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [quizzes, setQuizzes] = useState<QuizHistoryItem[]>([]);
  const [summaries, setSummaries] = useState<Array<{ id: string; source_text: string; summary_text: string; created_at: string }>>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const location = useLocation();
  const filter = (location.state?.filter as string) || null;
  const summariesRef = useRef<HTMLDivElement>(null);
  const quizzesRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user?.id) return;

    const loadData = async () => {
      setLoading(true);
      try {
        const [canvasEntries, quizEntries, summaryEntries] = await Promise.all([
          fetchCanvasEntries(user.id),
          fetchQuizAttempts(user.id),
          fetchSummaries(user.id),
        ]);

        setItems(
          canvasEntries.map((entry) => ({
            id: entry.id,
            content: entry.content,
            createdAt: new Date(entry.created_at).getTime(),
          })),
        );
        setQuizzes(
          quizEntries.map((entry) => ({
            id: entry.id,
            questions: entry.questions ?? [],
            score: entry.score ?? 0,
            totalQuestions: entry.total_questions ?? 0,
            text: entry.source_text ?? "",
            createdAt: new Date(entry.created_at).getTime(),
          })),
        );
        setSummaries(summaryEntries);
      } catch (err) {
        console.error("[History] Failed to load history:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user?.id]);

  useEffect(() => {
    if (!loading && filter) {
      let ref: React.RefObject<HTMLDivElement> | null = null;
      if (filter === "summaries") {
        ref = summariesRef;
      } else if (filter === "quizzes") {
        ref = quizzesRef;
      } else if (filter === "canvas") {
        ref = canvasRef;
      }
      
      if (ref?.current) {
        setTimeout(() => {
          ref?.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      }
    }
  }, [loading, filter]);

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
      {loading ? (
        <div className="rounded-2xl border border-border/60 bg-white/80 p-6 text-sm text-foreground/70">
          Loading your history…
        </div>
      ) : null}
      <section ref={quizzesRef}>
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

      <section ref={summariesRef}>
        <h2 className="text-2xl font-semibold text-foreground mb-4">AI Summaries</h2>
        {summaries.length === 0 ? (
          <p className="text-sm text-foreground/70">No saved summaries yet.</p>
        ) : (
          <ul className="space-y-4">
            {summaries.map((item) => (
              <li key={item.id} className="rounded-2xl border border-border/70 bg-white/80 p-4 shadow-sm">
                <p className="text-xs text-foreground/60">
                  {new Date(item.created_at).toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-foreground/80">Source: {item.source_text}</p>
                <div className="mt-3 rounded-xl border border-border/60 bg-muted/30 p-3 text-sm text-foreground/80 whitespace-pre-line">
                  {item.summary_text}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section ref={canvasRef}>
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
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
}


