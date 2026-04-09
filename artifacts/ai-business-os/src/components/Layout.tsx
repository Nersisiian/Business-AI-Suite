import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Users,
  Briefcase,
  CheckSquare,
  LogOut,
  Zap,
  Settings,
  Bell,
} from "lucide-react";
import { clearToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/deals", label: "Deals", icon: Briefcase },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
];

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2).toUpperCase();
}

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { data: me } = useGetMe({ query: { queryKey: getGetMeQueryKey() } });

  function handleLogout() {
    clearToken();
    queryClient.clear();
    setLocation("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <aside className="flex flex-col w-56 min-h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sidebar-primary shadow-sm">
            <Zap size={14} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight">AI Business OS</span>
        </div>

        {/* Nav section label */}
        <div className="px-4 pt-5 pb-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">Workspace</p>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-2 space-y-0.5">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}
                data-testid={`nav-${label.toLowerCase()}`}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all cursor-pointer select-none ${
                  isActive
                    ? "bg-white/10 text-white font-medium"
                    : "text-sidebar-foreground/60 hover:bg-white/6 hover:text-sidebar-foreground/90"
                }`}
              >
                <Icon size={15} className={isActive ? "text-sidebar-primary" : "opacity-70"} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          <button className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-sidebar-foreground/50 hover:bg-white/6 hover:text-sidebar-foreground/80 transition-all">
            <Settings size={15} />
            <span>Settings</span>
          </button>
          <button
            data-testid="button-logout"
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-[13px] text-sidebar-foreground/50 hover:bg-white/6 hover:text-sidebar-foreground/80 transition-all"
          >
            <LogOut size={15} />
            <span>Sign out</span>
          </button>
        </div>

        {/* User profile */}
        {me && (
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-sidebar-border">
            <div className="flex items-center justify-center w-7 h-7 rounded-full bg-sidebar-primary text-white text-[11px] font-bold flex-shrink-0">
              {getInitials(me.name)}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white/90 truncate">{me.name}</p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">{me.email}</p>
            </div>
          </div>
        )}
      </aside>

      {/* Main content with top bar */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {navItems.find(n => location === n.href || location.startsWith(n.href + "/"))?.label ?? "Dashboard"}
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <Bell size={16} />
            </button>
            {me && (
              <div className="flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white text-[11px] font-bold">
                {getInitials(me.name)}
              </div>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
