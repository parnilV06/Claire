import { supabase } from "@/lib/supabaseClient";

type AssessmentResult = {
  assessmentDate: string;
  totalScore: number;
  severityLevel: string;
  categoryScores: Record<string, number>;
  responses: Array<{ questionId: string; answer: string | null; score: number }>;
};

type QuizAttemptInput = {
  questions: any[];
  score: number;
  totalQuestions: number;
  text: string;
  createdAt?: number;
};

type CanvasEntryInput = {
  content: string;
  createdAt?: number;
};

type SummaryInput = {
  sourceText: string;
  summaryText: string;
  createdAt?: number;
};

type TherapistReferralInput = {
  name: string;
  mobile: string;
  age?: string;
  message: string;
  createdAt?: number;
};

export async function insertAssessmentResult(userId: string, result: AssessmentResult) {
  return supabase.from("assessment_results").insert({
    user_id: userId,
    assessment_date: result.assessmentDate,
    total_score: result.totalScore,
    severity_level: result.severityLevel,
    category_scores: result.categoryScores,
    responses: result.responses,
  });
}

export async function fetchLatestAssessmentResult(userId: string) {
  const { data, error } = await supabase
    .from("assessment_results")
    .select("assessment_date,total_score,severity_level,category_scores")
    .eq("user_id", userId)
    .order("assessment_date", { ascending: false })
    .limit(1);

  if (error) throw error;
  return data?.[0] ?? null;
}

export async function insertCanvasEntry(userId: string, entry: CanvasEntryInput) {
  return supabase.from("canvas_entries").insert({
    user_id: userId,
    content: entry.content,
    created_at: entry.createdAt ? new Date(entry.createdAt).toISOString() : undefined,
  });
}

export async function fetchCanvasEntries(userId: string) {
  const { data, error } = await supabase
    .from("canvas_entries")
    .select("id,content,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertSummary(userId: string, summary: SummaryInput) {
  return supabase.from("ai_summaries").insert({
    user_id: userId,
    source_text: summary.sourceText,
    summary_text: summary.summaryText,
    created_at: summary.createdAt ? new Date(summary.createdAt).toISOString() : undefined,
  });
}

export async function fetchSummaries(userId: string) {
  const { data, error } = await supabase
    .from("ai_summaries")
    .select("id,source_text,summary_text,created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function insertQuizAttempt(userId: string, attempt: QuizAttemptInput) {
  return supabase.from("quiz_attempts").insert({
    user_id: userId,
    questions: attempt.questions,
    score: attempt.score,
    total_questions: attempt.totalQuestions,
    source_text: attempt.text,
    created_at: attempt.createdAt ? new Date(attempt.createdAt).toISOString() : undefined,
  });
}

export async function fetchQuizAttempts(userId: string) {
  const { data, error } = await supabase
    .from("quiz_attempts")
    .select("id,score,total_questions,source_text,created_at,questions")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}

export async function fetchProfileCounts(userId: string) {
  const [summaries, quizzes, canvas] = await Promise.all([
    supabase.from("ai_summaries").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("quiz_attempts").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase.from("canvas_entries").select("id", { count: "exact", head: true }).eq("user_id", userId),
  ]);

  return {
    summaries: summaries.count ?? 0,
    quizzes: quizzes.count ?? 0,
    canvas: canvas.count ?? 0,
  };
}

export async function migrateLocalHistoryToSupabase(userId: string) {
  const migrationKey = `claire.migrated.${userId}`;
  try {
    if (localStorage.getItem(migrationKey) === "1") return;
  } catch {
    return;
  }

  const inserts: Promise<any>[] = [];

  try {
    const rawHistory = localStorage.getItem("brightpath.history");
    if (rawHistory) {
      const items = JSON.parse(rawHistory) as Array<{ content: string; summary?: string; createdAt?: number }>;
      for (const item of items) {
        if (item.summary) {
          inserts.push(
            insertSummary(userId, {
              sourceText: item.content,
              summaryText: item.summary,
              createdAt: item.createdAt,
            }),
          );
        } else if (item.content) {
          inserts.push(
            insertCanvasEntry(userId, {
              content: item.content,
              createdAt: item.createdAt,
            }),
          );
        }
      }
    }
  } catch {}

  try {
    const rawQuiz = localStorage.getItem("brightpath.quizHistory");
    if (rawQuiz) {
      const items = JSON.parse(rawQuiz) as Array<any>;
      for (const item of items) {
        inserts.push(
          insertQuizAttempt(userId, {
            questions: item.questions ?? [],
            score: item.score ?? 0,
            totalQuestions: item.totalQuestions ?? (item.questions?.length ?? 0),
            text: item.text ?? "",
            createdAt: item.createdAt,
          }),
        );
      }
    }
  } catch {}

  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (!key || !key.startsWith("assessment_result_")) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw) as AssessmentResult;
      if (!parsed?.assessmentDate) continue;
      inserts.push(insertAssessmentResult(userId, parsed));
      break;
    }
  } catch {}

  try {
    await Promise.all(inserts);
  } catch (err) {
    console.error("[Supabase] Migration failed:", err);
  }

  try {
    localStorage.setItem(migrationKey, "1");
  } catch {}
}

export async function insertTherapistReferral(userId: string, referral: TherapistReferralInput) {
  return supabase.from("therapist_referrals").insert({
    user_id: userId,
    name: referral.name,
    mobile: referral.mobile,
    age: referral.age,
    message: referral.message,
    status: "pending",
    created_at: referral.createdAt ? new Date(referral.createdAt).toISOString() : undefined,
  });
}

export async function fetchTherapistReferrals(userId: string) {
  const { data, error } = await supabase
    .from("therapist_referrals")
    .select("id,name,mobile,age,message,status,therapist_name,therapist_contact,therapist_details,created_at,updated_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data ?? [];
}
