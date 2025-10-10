import React, { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

type Option = { value: string; label: string; score: number };
type Question = {
  id: string;
  type: string;
  text: string;
  options?: Option[];
};

type Category = {
  id: string;
  name: string;
  questions: Question[];
};

type AssessmentJSON = {
  assessmentTitle: string;
  assessmentDescription: string;
  categories: Category[];
};

const STORAGE_PREFIX = "assessment_result_";

function pickRandomQuestions(categories: Category[], total = 15): Question[] {
  // ensure at least 2 per category
  const perCatMin = 2;
  const picked: Question[] = [];
  const leftovers: Question[] = [];

  for (const cat of categories) {
    const qs = [...cat.questions];
    // shuffle
    for (let i = qs.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [qs[i], qs[j]] = [qs[j], qs[i]];
    }
    const take = Math.min(perCatMin, qs.length);
    picked.push(...qs.slice(0, take));
    leftovers.push(...qs.slice(take));
  }

  // fill remaining
  const remaining = Math.max(0, total - picked.length);
  // shuffle leftovers
  for (let i = leftovers.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [leftovers[i], leftovers[j]] = [leftovers[j], leftovers[i]];
  }
  picked.push(...leftovers.slice(0, remaining));

  // as a safety, if still short, flatten and reuse
  if (picked.length < total) {
    const flat = categories.flatMap((c) => c.questions);
    for (let i = 0; picked.length < total && i < flat.length; i++) {
      if (!picked.find((q) => q.id === flat[i].id)) picked.push(flat[i]);
    }
  }

  return picked.slice(0, total);
}

export default function AssessmentPage() {
  const [data, setData] = useState<AssessmentJSON | null>(null);
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [result, setResult] = useState<any | null>(null);

  useEffect(() => {
    fetch(import.meta.env.BASE_URL + "dyslexia_assessment.json")
      .then((r) => r.json())
      .then((json) => {
        setData(json);
    const picked = pickRandomQuestions(json.categories, 15);
        setQuestions(picked);
      })
      .catch((err) => console.error("Failed to load assessment JSON", err));
  }, []);

  useEffect(() => {
    const storedId = localStorage.getItem("claire_user_id");
    if (storedId) setUserId(storedId);
  }, []);

  const total = questions?.length ?? 0;

  const currentQuestion = questions ? questions[current] : null;

  useEffect(() => {
    // if userId and stored results exist, load and block
    if (!userId) return;
    const stored = localStorage.getItem(STORAGE_PREFIX + userId);
    if (stored) {
      try {
        setResult(JSON.parse(stored));
      } catch {}
    }
  }, [userId]);

  const handleSelect = (qid: string, value: string) => {
    setAnswers((s) => ({ ...s, [qid]: value }));
  };

  const goNext = () => {
    if (current < (questions?.length ?? 0) - 1) setCurrent((c) => c + 1);
  };
  const goPrev = () => {
    if (current > 0) setCurrent((c) => c - 1);
  };

  const computeAndSave = (id: string) => {
    if (!questions || !data) return;
    const responses: any[] = [];
    const categoryScores: Record<string, number> = {};
    for (const cat of data.categories) categoryScores[cat.id] = 0;
    let totalScore = 0;
    for (const q of questions) {
      const ansVal = answers[q.id] ?? null;
      let score = 0;
      if (q.options && ansVal) {
        const opt = q.options.find((o) => o.value === ansVal);
        if (opt) score = opt.score ?? 0;
      }
      responses.push({ questionId: q.id, answer: ansVal, score });
      totalScore += score;
      const cat = q.id?.[0] ?? "?";
      if (categoryScores[cat] !== undefined) categoryScores[cat] += score;
    }

    let severity: string = "mild";
    if (totalScore >= 91) severity = "severe";
    else if (totalScore >= 61) severity = "significant";
    else if (totalScore >= 31) severity = "moderate";
    else severity = "mild";

    const payload = {
      userId: id,
      assessmentDate: new Date().toISOString(),
      totalScore,
      severityLevel: severity,
      categoryScores,
      responses,
    };

    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(payload));
    setResult(payload);
  };

  const onSubmit = () => {
    if (!userId) {
      const id = window.prompt("Enter a user id to save your assessment results (this will block retakes):");
      if (!id) return;
      localStorage.setItem("claire_user_id", id);
      setUserId(id);
      computeAndSave(id);
      return;
    }
    // confirm
    if (!window.confirm("Submit assessment? This will save your results and block retakes.")) return;
    computeAndSave(userId);
  };

  if (!data || !questions) return <div>Loading assessment…</div>;

  if (result) {
    const chartData = Object.entries(result.categoryScores).map(([key, val]) => ({ category: key, score: val }));
    return (
      <div className="mx-auto max-w-3xl">
        <h2 className="text-2xl font-semibold">{data.assessmentTitle} — Results</h2>
        <p className="mt-2">Total score: <strong>{result.totalScore}</strong></p>
        <p>Severity: <strong>{result.severityLevel}</strong></p>
        <div style={{ height: 240 }} className="mt-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="score" fill="#2563EB" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold">Responses</h3>
          <ul className="mt-2 space-y-2">
            {result.responses.map((r: any) => (
              <li key={r.questionId} className="rounded-md bg-muted/40 p-3">
                <div className="text-sm">{r.questionId} — Answer: {String(r.answer)}</div>
                <div className="text-xs text-muted-foreground">Score: {r.score}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h2 className="text-2xl font-semibold">{data.assessmentTitle}</h2>
      <p className="mt-2 text-sm text-foreground/70">{data.assessmentDescription}</p>

      <div className="mt-6">
        <div className="text-sm mb-2">Question {current + 1} of {total}</div>
        <div className="rounded-lg border p-4">
          <div className="text-base font-medium">{currentQuestion?.text}</div>
          <div className="mt-3 space-y-2">
            {currentQuestion?.options?.map((opt) => (
              <label key={opt.value} className="flex items-center gap-3 rounded-md p-2 hover:bg-muted/30">
                <input
                  type="radio"
                  name={currentQuestion.id}
                  value={opt.value}
                  checked={answers[currentQuestion.id] === opt.value}
                  onChange={() => handleSelect(currentQuestion.id, opt.value)}
                />
                <span>{opt.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <Button variant="outline" onClick={goPrev} disabled={current === 0}>Prev</Button>
          {current < total - 1 ? (
            <Button onClick={goNext} disabled={!answers[currentQuestion!.id]}>Next</Button>
          ) : (
            <Button onClick={onSubmit} disabled={!answers[currentQuestion!.id]}>Submit</Button>
          )}
        </div>
      </div>
    </div>
  );
}
