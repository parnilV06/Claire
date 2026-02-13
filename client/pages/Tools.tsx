import { ToolsShowcase } from "@/components/sections/ToolsShowcase";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { UsageLimitDialog } from "@/components/auth/UsageLimitDialog";
import { hasReachedLimit, incrementUsage } from "@/lib/usageLimits";
import { insertCanvasEntry } from "@/lib/supabaseData";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function ToolsPage() {
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [limitDialogOpen, setLimitDialogOpen] = useState(false);
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const handleSaveToHistory = useCallback(async (content: string) => {
    try {
      const raw = localStorage.getItem("brightpath.history");
      const list = raw ? (JSON.parse(raw) as Array<any>) : [];
      const item = { id: crypto.randomUUID(), content, createdAt: Date.now() };
      localStorage.setItem("brightpath.history", JSON.stringify([item, ...list]));
      if (user?.id) {
        await insertCanvasEntry(user.id, {
          content,
          createdAt: item.createdAt,
        });
      }
      setSaveMessage("Saved to history.");
      setTimeout(() => setSaveMessage(null), 2200);
    } catch {
      setSaveMessage("Could not save history.");
      setTimeout(() => setSaveMessage(null), 2200);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user) return;
    try {
      const shouldPrompt = localStorage.getItem("claire.onboardingPrompt") === "1";
      if (shouldPrompt) {
        setOnboardingOpen(true);
      }
    } catch {}
  }, [user]);
  return (
    <div className="space-y-24">
      <ToolsShowcase />
      <div className="text-center">
        <button
          className="rounded-full px-6 py-3 text-base font-semibold shadow-md transition-colors duration-200"
          style={{
            backgroundColor: '#FBF6EE',
            color: '#3889A5',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3889A5';
            e.currentTarget.style.color = '#FBF6EE';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#FBF6EE';
            e.currentTarget.style.color = '#3889A5';
          }}
          onClick={() => {
            const area = document.querySelector("textarea");
            const content = area ? (area as HTMLTextAreaElement).value : "";
            if (!user && hasReachedLimit("canvas")) {
              setLimitDialogOpen(true);
              return;
            }
            if (!user) {
              incrementUsage("canvas");
            }
            handleSaveToHistory(content);
          }}
        >
          Save canvas to history
        </button>
        {saveMessage ? (
          <div className="mt-2 text-xs text-emerald-600">{saveMessage}</div>
        ) : null}
      </div>
      <UsageLimitDialog
        open={limitDialogOpen}
        onOpenChange={setLimitDialogOpen}
        featureLabel="canvas"
      />
      <Dialog open={onboardingOpen} onOpenChange={setOnboardingOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start your dyslexia check-in</DialogTitle>
            <DialogDescription>
              Take the onboarding dyslexia quiz for a more personalized Claire experience.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setOnboardingOpen(false);
                try {
                  localStorage.removeItem("claire.onboardingPrompt");
                } catch {}
              }}
            >
              Not now
            </Button>
            <Button
              onClick={() => {
                setOnboardingOpen(false);
                try {
                  localStorage.removeItem("claire.onboardingPrompt");
                } catch {}
                navigate("/assessment");
              }}
            >
              Take the quiz
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


