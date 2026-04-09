import { useState } from "react";
import { useLocation } from "wouter";
import { useLogin } from "@workspace/api-client-react";
import { setToken } from "@/lib/auth";
import { Zap, ArrowRight, BarChart2, Users, CheckCircle } from "lucide-react";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setToken(data.token);
        setLocation("/dashboard");
      },
      onError: () => {
        setError("Invalid email or password. Please try again.");
      },
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    loginMutation.mutate({ data: { email, password } });
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col w-[46%] bg-sidebar text-white p-10 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full bg-white/5" />
          <div className="absolute -bottom-20 -right-20 w-72 h-72 rounded-full bg-white/5" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-white/5" />
        </div>

        <div className="flex items-center gap-2.5 mb-auto">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-sidebar-primary">
            <Zap size={16} className="text-white" />
          </div>
          <span className="text-sm font-semibold">AI Business OS</span>
        </div>

        <div className="my-auto">
          <p className="text-[11px] uppercase tracking-widest text-white/40 font-semibold mb-4">Your AI-powered CRM</p>
          <h2 className="text-3xl font-bold leading-tight mb-4">Run your entire business from one place</h2>
          <p className="text-white/50 text-sm leading-relaxed mb-10">
            Manage clients, close deals, track tasks — all supercharged with AI insights and automation.
          </p>

          <ul className="space-y-3">
            {[
              { icon: Users, text: "Smart client relationship management" },
              { icon: BarChart2, text: "AI deal analysis & probability scoring" },
              { icon: CheckCircle, text: "Intelligent task prioritization" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-white/70">
                <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-white/10 flex-shrink-0">
                  <Icon size={13} className="text-white/80" />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-white/20 mt-auto">© 2026 AI Business OS</p>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary">
              <Zap size={15} className="text-white" />
            </div>
            <span className="text-sm font-semibold">AI Business OS</span>
          </div>

          <div className="mb-8">
            <h1 className="text-2xl font-bold tracking-tight mb-1.5">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to continue to your workspace</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[13px] font-medium block mb-1.5" htmlFor="email">Email address</label>
              <input
                id="email"
                data-testid="input-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@company.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[13px] font-medium" htmlFor="password">Password</label>
              </div>
              <input
                id="password"
                data-testid="input-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-ring transition"
              />
            </div>

            {error && (
              <div data-testid="text-login-error" className="flex items-center gap-2 p-3 rounded-xl bg-destructive/8 border border-destructive/20 text-sm text-destructive">
                <div className="w-1.5 h-1.5 rounded-full bg-destructive flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              data-testid="button-submit"
              type="submit"
              disabled={loginMutation.isPending}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition disabled:opacity-60"
            >
              {loginMutation.isPending ? (
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          <p className="mt-6 text-sm text-center text-muted-foreground">
            Don't have an account?{" "}
            <a
              data-testid="link-register"
              href="/register"
              className="text-primary font-semibold hover:underline"
              onClick={(e) => { e.preventDefault(); setLocation("/register"); }}
            >
              Create one free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
