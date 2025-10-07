import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import { MainLayout } from "@/components/layout/MainLayout";
import { ComingSoon } from "@/components/common/ComingSoon";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";
import ToolsPage from "./pages/Tools";
import HistoryPage from "./pages/History";
import SupportPage from "./pages/Support";
import QuizPage from "./pages/Quiz";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/tools" element={<ToolsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/support" element={<SupportPage />} />
              <Route path="/quiz" element={<QuizPage />} />
            <Route
              path="/assessment"
              element={
                <ComingSoon
                  title="Guided assessment"
                  description="This flow will adapt reading, writing, and sensory prompts to build a unique support profile. Let me know when you want the full assessment experience implemented."
                  tips={[
                    "Blend voice and text questions for accessibility.",
                    "Capture energy levels, triggers, and calming supports.",
                  ]}
                />
              }
            />
            <Route
              path="/dashboard"
              element={
                <ComingSoon
                  title="Student dashboard"
                  description="Track literacy growth, emotional wellness, and personalized routines. Ask for more details to build this screen."
                  tips={[
                    "Progress streaks and mood timelines.",
                    "Quick links to supportive exercises and AI reflections.",
                  ]}
                />
              }
            />
            <Route
              path="/support"
              element={
                <ComingSoon
                  title="Therapy & support pathways"
                  description="Connect with specialists, NGOs, and guided emotional resources tailored to each learner. Prompt again for full build-out."
                  tips={[
                    "Live chat with emotional companion.",
                    "Scheduling with therapists and group circles.",
                  ]}
                />
              }
            />
            <Route
              path="/privacy"
              element={
                <ComingSoon
                  title="Privacy promise"
                  description="Outline data safeguards, consent controls, and family privacy settings here."
                />
              }
            />
            <Route
              path="/terms"
              element={
                <ComingSoon
                  title="Terms of use"
                  description="Define community guidelines and accessibility commitments for BrightPath."
                />
              }
            />
            <Route
              path="/accessibility"
              element={
                <ComingSoon
                  title="Accessibility statement"
                  description="Document inclusive design standards, testing practices, and assistive technology support."
                />
              }
            />
            <Route
              path="/contact"
              element={
                <ComingSoon
                  title="Contact BrightPath"
                  description="Share ways for schools, families, and partners to reach out for support or collaboration."
                />
              }
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

createRoot(document.getElementById("root")!).render(<App />);
