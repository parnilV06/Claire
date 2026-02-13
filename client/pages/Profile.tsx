import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, UserCheck, Clock, CheckCircle, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { fetchLatestAssessmentResult, fetchProfileCounts, fetchTherapistReferrals } from "@/lib/supabaseData";

type AssessmentResult = {
  assessmentDate: string;
  totalScore: number;
  severityLevel: string;
  categoryScores: Record<string, number>;
};

type TherapistReferral = {
  id: string;
  name: string;
  mobile: string;
  age?: string;
  message: string;
  status: string;
  therapist_name?: string;
  therapist_contact?: string;
  therapist_details?: string;
  created_at: string;
  updated_at?: string;
};

export default function ProfilePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [counts, setCounts] = useState<{ summaries: number; quizzes: number; canvas: number } | null>(null);
  const [referrals, setReferrals] = useState<TherapistReferral[]>([]);

  useEffect(() => {
    if (!user?.id) return;
    const loadProfile = async () => {
      try {
        const [latest, profileCounts, therapistReferrals] = await Promise.all([
          fetchLatestAssessmentResult(user.id),
          fetchProfileCounts(user.id),
          fetchTherapistReferrals(user.id),
        ]);
        
        if (latest) {
          console.log("[Profile] Latest assessment from DB:", latest);
          setResult({
            assessmentDate: latest.assessment_date,
            totalScore: latest.total_score,
            severityLevel: latest.severity_level,
            categoryScores: latest.category_scores,
          });
        } else {
          // Fallback to localStorage if database returns null
          const localData = localStorage.getItem(`assessment_result_${user.id}`);
          if (localData) {
            console.log("[Profile] Using assessment from localStorage");
            const parsed = JSON.parse(localData);
            setResult({
              assessmentDate: parsed.assessmentDate,
              totalScore: parsed.totalScore,
              severityLevel: parsed.severityLevel,
              categoryScores: parsed.categoryScores,
            });
          }
        }
        setCounts(profileCounts);
        setReferrals(therapistReferrals);
      } catch (err) {
        console.error("[Profile] Failed to load profile data:", err);
        // Try localStorage as final fallback
        const localData = localStorage.getItem(`assessment_result_${user.id}`);
        if (localData) {
          console.log("[Profile] Error loading from DB, using localStorage");
          const parsed = JSON.parse(localData);
          setResult({
            assessmentDate: parsed.assessmentDate,
            totalScore: parsed.totalScore,
            severityLevel: parsed.severityLevel,
            categoryScores: parsed.categoryScores,
          });
        }
      }
    };

    loadProfile();
  }, [user?.id]);

  const displayName = useMemo(() => {
    const metadataName = (user?.user_metadata?.full_name as string | undefined) || "";
    if (metadataName.trim()) return metadataName;
    const email = user?.email || "";
    return email.split("@")[0] || "Claire learner";
  }, [user?.email, user?.user_metadata]);

  const roleLabel = (user?.user_metadata?.role as string | undefined) || "student";

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <section className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
        <h1 className="text-2xl font-semibold text-foreground">Profile</h1>
        <p className="mt-1 text-sm text-foreground/70">Manage your Claire experience and view your onboarding results.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-foreground/60">Name</p>
            <p className="mt-1 text-base font-semibold text-foreground">{displayName}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-foreground/60">Username</p>
            <p className="mt-1 text-base font-semibold text-foreground">{user?.email}</p>
          </div>
          <div className="rounded-2xl border border-border/60 bg-muted/40 p-4">
            <p className="text-xs font-semibold uppercase text-foreground/60">Role</p>
            <p className="mt-1 text-base font-semibold capitalize text-foreground">{roleLabel}</p>
          </div>
          
          {/* Clickable stat cards with navigation */}
          <button
            onClick={() => navigate("/history", { state: { filter: "summaries" } })}
            className="group rounded-2xl border border-border/60 bg-muted/40 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase text-foreground/60">Saved summaries</p>
                <p className="mt-1 text-base font-semibold text-foreground">{counts?.summaries ?? 0}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-foreground/40 transition-all group-hover:text-primary" />
            </div>
          </button>

          <button
            onClick={() => navigate("/history", { state: { filter: "quizzes" } })}
            className="group rounded-2xl border border-border/60 bg-muted/40 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase text-foreground/60">Quiz attempts</p>
                <p className="mt-1 text-base font-semibold text-foreground">{counts?.quizzes ?? 0}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-foreground/40 transition-all group-hover:text-primary" />
            </div>
          </button>

          <button
            onClick={() => navigate("/history", { state: { filter: "canvas" } })}
            className="group rounded-2xl border border-border/60 bg-muted/40 p-4 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-xs font-semibold uppercase text-foreground/60">Canvas saves</p>
                <p className="mt-1 text-base font-semibold text-foreground">{counts?.canvas ?? 0}</p>
              </div>
              <ArrowRight className="h-5 w-5 text-foreground/40 transition-all group-hover:text-primary" />
            </div>
          </button>
        </div>
      </section>

      <section className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Onboarding Dyslexia Quiz</h2>
            <p className="text-sm text-foreground/70">Your latest onboarding assessment results.</p>
          </div>
          {result ? (
            <button
              onClick={() => navigate("/assessment")}
              className="group flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-4 py-2 transition-all hover:border-primary/70 hover:bg-primary/10"
            >
              <span className="text-sm font-medium text-foreground">View Details</span>
              <ArrowRight className="h-4 w-4 text-foreground/60 transition-all group-hover:text-primary" />
            </button>
          ) : (
            <Link to="/assessment">
              <Button variant="outline">Take quiz</Button>
            </Link>
          )}
        </div>

        {result ? (
          <div className="mt-6 space-y-4">
            <div className="flex flex-wrap gap-3 text-sm text-foreground/80">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-primary">Score: {result.totalScore}</span>
              <span className="rounded-full bg-muted/40 px-3 py-1 capitalize">Severity: {result.severityLevel}</span>
              <span className="rounded-full bg-muted/40 px-3 py-1">
                Date: {new Date(result.assessmentDate).toLocaleDateString()}
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {Object.entries(result.categoryScores).map(([key, value]) => (
                <div key={key} className="rounded-2xl border border-border/60 bg-muted/30 p-3">
                  <p className="text-xs font-semibold uppercase text-foreground/60">Category {key}</p>
                  <p className="mt-1 text-sm font-semibold text-foreground">Score: {value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-foreground/70">
            No onboarding quiz results yet. Take the assessment to personalize your Claire experience.
          </div>
        )}
      </section>

      {/* Therapist Referral Section */}
      <section className="rounded-3xl border border-border/70 bg-white/85 p-6 shadow-lg backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-foreground">Therapist Support</h2>
            <p className="text-sm text-foreground/70">Track your therapist referral requests and assignments.</p>
          </div>
          <button
            onClick={() => navigate("/support")}
            className="group flex items-center gap-2 rounded-lg border border-border/60 bg-muted/40 px-4 py-2 transition-all hover:border-primary/50 hover:bg-primary/5"
          >
            <span className="text-sm font-medium text-foreground">Request Support</span>
            <ArrowRight className="h-4 w-4 text-foreground/40 transition-all group-hover:text-primary" />
          </button>
        </div>

        <div className="mt-6">
          {referrals.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/70 bg-muted/20 p-8 text-center">
              <UserCheck className="mx-auto h-12 w-12 text-foreground/30" />
              <p className="mt-3 text-sm font-medium text-foreground/70">No therapist requests yet</p>
              <p className="mt-1 text-xs text-foreground/60">
                When you submit a referral request, you'll see your therapist details and request status here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {referrals.map((referral) => (
                <div key={referral.id} className="rounded-2xl border border-border/60 bg-white/80 p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-semibold text-foreground">Request #{referral.id.slice(0, 8)}</h3>
                        {referral.status === 'pending' && (
                          <span className="flex items-center gap-1 rounded-full bg-yellow-100 px-2 py-0.5 text-xs font-medium text-yellow-800">
                            <Clock className="h-3 w-3" />
                            Pending
                          </span>
                        )}
                        {referral.status === 'assigned' && (
                          <span className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-800">
                            <CheckCircle className="h-3 w-3" />
                            Assigned
                          </span>
                        )}
                        {referral.status === 'completed' && (
                          <span className="flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-800">
                            <CheckCircle className="h-3 w-3" />
                            Completed
                          </span>
                        )}
                        {referral.status === 'cancelled' && (
                          <span className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-800">
                            <XCircle className="h-3 w-3" />
                            Cancelled
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-foreground/60">
                        Submitted on {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {referral.therapist_name ? (
                    <div className="mt-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
                      <p className="text-sm font-semibold text-foreground">Assigned Therapist</p>
                      <div className="mt-2 space-y-1">
                        <p className="text-sm text-foreground/80">
                          <span className="font-medium">Name:</span> {referral.therapist_name}
                        </p>
                        {referral.therapist_contact && (
                          <p className="text-sm text-foreground/80">
                            <span className="font-medium">Contact:</span> {referral.therapist_contact}
                          </p>
                        )}
                        {referral.therapist_details && (
                          <p className="mt-2 text-xs text-foreground/70">{referral.therapist_details}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 rounded-xl border border-border/50 bg-muted/20 p-4">
                      <p className="text-sm text-foreground/70">
                        Your request is being processed. A therapist will be assigned to you soon, and you'll see their details here.
                      </p>
                    </div>
                  )}

                  <div className="mt-3 text-xs text-foreground/60">
                    <span className="font-medium">Your message:</span> {referral.message}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
