import { useState } from "react";
import { Link, NavLink, Outlet, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Home" },
  { to: "/tools", label: "Tools" },
  { to: "/support", label: "Support" },
  { to: "/history", label: "History" },
];

type MainLayoutProps = {
  children?: React.ReactNode;
};

export function MainLayout({ children }: MainLayoutProps) {
  const content = children ?? <Outlet />;
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const toggleMenu = () => setIsOpen((prev) => !prev);
  const closeMenu = () => setIsOpen(false);

  return (
    <div className="min-h-screen bg-soft-radial">
      <header className="sticky top-0 z-40 backdrop-blur bg-background/80 border-b border-border/60">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-2 text-lg font-bold">
            <span className="relative flex items-center">
              <img
                src="/claire_logo.png"
                alt="Claire logo"
                className="h-10 w-10 rounded-xl bg-primary/20 object-contain mr-2"
              />
              <span className="text-primary">Claire</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
            {navItems.map(({ to, label }) => {
              return (
                <NavLink
                  key={to}
                  to={to}
                  end={to === "/"}
                  className={({ isActive }) =>
                    cn(
                      "rounded-full px-4 py-2 transition-colors",
                      isActive
                        ? "bg-primary/90 text-primary-foreground shadow-sm"
                        : "text-foreground/80 hover:bg-primary/10 hover:text-foreground",
                    )
                  }
                >
                  {label}
                </NavLink>
              );
            })}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login">
              <Button variant="ghost" className="rounded-full px-6">
                Log in
              </Button>
            </Link>
            <Link to="/assessment">
              <Button className="rounded-full px-6 shadow-lg shadow-primary/40">
                Start assessment
              </Button>
            </Link>
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-full border border-border p-2 text-foreground/80 md:hidden"
            onClick={toggleMenu}
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
        {isOpen ? (
          <div className="border-t border-border/60 bg-background/95 shadow-lg md:hidden">
            <nav className="flex flex-col gap-1 px-6 py-4 text-sm">
              {navItems.map(({ to, label }) => {
                return (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === "/"}
                    onClick={closeMenu}
                    className={({ isActive }) =>
                      cn(
                        "rounded-xl px-3 py-2",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-foreground/80 hover:bg-primary/10 hover:text-foreground",
                      )
                    }
                  >
                    {label}
                  </NavLink>
                );
              })}
              <Link to="/login" onClick={closeMenu} className="rounded-xl px-3 py-2">
                Log in
              </Link>
              <Link to="/assessment" onClick={closeMenu} className="rounded-xl px-3 py-2">
                Start assessment
              </Link>
            </nav>
          </div>
        ) : null}
      </header>
      <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:py-16 lg:py-20">
        {content}
      </main>
      <footer className="border-t border-border/60 bg-background/80">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-10 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <img src="/claire_logo.png" alt="Claire logo" className="h-10 w-10 rounded-xl object-contain" />
            <div>
              <p className="text-lg font-semibold text-foreground">Claire</p>
              <p className="mt-2 max-w-md text-sm text-foreground/70">
                Empowering dyslexic students with accessible tools, compassionate
                support, and collaborative guidance for brighter learning journeys. Powered by Claire.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-foreground/70 sm:grid-cols-3">
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Product</p>
              <Link to="/#tools" className="block hover:text-primary">
                Learning tools
              </Link>
              <Link to="/dashboard" className="block hover:text-primary">
                Student dashboard
              </Link>
              <Link to="/tools" className="block hover:text-primary">
                Creative canvas
              </Link>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Community</p>
              <Link to="/assessment" className="block hover:text-primary">
                Personal assessment
              </Link>
              <Link to="/support" className="block hover:text-primary">
                Therapy &amp; support
              </Link>
              <a
                href="mailto:hello@claire.app"
                className="block hover:text-primary"
              >
                Contact
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-semibold text-foreground">Resources</p>
              <Link to="/login" className="block hover:text-primary">
                Parent portal
              </Link>
              <Link to="/support" className="block hover:text-primary">
                Emotional guidance
              </Link>
              <Link to="/privacy" className="block hover:text-primary">
                Privacy
              </Link>
            </div>
          </div>
        </div>
        <div className="border-t border-border/50 bg-background/60 py-4">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 text-xs text-foreground/60">
            <p>&copy; {new Date().getFullYear()} Claire. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-primary">
                Terms
              </Link>
              <Link to="/privacy" className="hover:text-primary">
                Privacy
              </Link>
              <Link to="/accessibility" className="hover:text-primary">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
