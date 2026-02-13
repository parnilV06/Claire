import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

export function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || user) return;
    const timeoutId = window.setTimeout(() => {
      navigate("/login", { replace: true, state: { from: location.pathname } });
    }, 450);

    return () => window.clearTimeout(timeoutId);
  }, [loading, user, navigate, location.pathname]);

  if (loading) {
    return <div className="py-10 text-center text-sm text-foreground/70">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="rounded-2xl border border-border/60 bg-white/80 p-6 text-center text-sm text-foreground/70 shadow-sm animate-in fade-in duration-300">
        <p className="text-base font-semibold text-foreground">This area is for members</p>
        <p className="mt-2">Redirecting you to log in…</p>
      </div>
    );
  }

  return children;
}
