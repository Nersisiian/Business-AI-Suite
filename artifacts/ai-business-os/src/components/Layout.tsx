import { Link, useLocation } from "wouter";
import { clearToken } from "@/lib/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";
import { Button, Avatar, SidebarSection, SidebarItem } from "@/components/ui";
import { LucideIcon, LayoutDashboard, Users, Briefcase, CheckSquare, LogOut, Zap, Settings, Bell } from "lucide-react";

// Конфиг sidebar
const sidebarConfig: {
  section: string;
  items: { href: string; label: string; icon: LucideIcon }[];
}[] = [
  {
    section: "Workspace",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/clients", label: "Clients", icon: Users },
      { href: "/deals", label: "Deals", icon: Briefcase },
      { href: "/tasks", label: "Tasks", icon: CheckSquare },
    ],
  },
];

function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(" ");
  return parts.length >= 2
    ? parts[0][0] + parts[1][0]
    : parts[0].slice(0, 2).toUpperCase();
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
          <span className="text-[13px] font-semibold text-white tracking-tight">
            AI Business OS
          </span>
        </div>

        {/* Навигация */}
        {sidebarConfig.map((section) => (
          <SidebarSection key={section.section} title={section.section}>
            {section.items.map(({ href, label, icon: Icon }) => {
              const isActive =
                location === href || location.startsWith(href + "/");
              return (
                <SidebarItem
                  key={href}
                  href={href}
                  icon={<Icon size={15} />}
                  active={isActive}
                >
                  {label}
                </SidebarItem>
              );
            })}
          </SidebarSection>
        ))}

        {/* Настройки и выход */}
        <div className="p-2 border-t border-sidebar-border space-y-0.5">
          <Button variant="ghost" className="w-full flex items-center gap-2.5">
            <Settings size={15} />
            Settings
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5"
          >
            <LogOut size={15} />
            Sign out
          </Button>
        </div>

        {/* Профиль */}
        {me && (
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-sidebar-border">
            <Avatar initials={getInitials(me.name)} />
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-white/90 truncate">
                {me.name}
              </p>
              <p className="text-[10px] text-sidebar-foreground/40 truncate">
                {me.email}
              </p>
            </div>
          </div>
        )}
      </aside>

      {/* Основной контент */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between px-6 h-14 border-b border-border bg-card/80 backdrop-blur-sm flex-shrink-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {sidebarConfig
              .flatMap((s) => s.items)
              .find((n) => location === n.href || location.startsWith(n.href + "/"))
              ?.label ?? "Dashboard"}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="icon">
              <Bell size={16} />
            </Button>
            {me && <Avatar initials={getInitials(me.name)} size="sm" />}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
