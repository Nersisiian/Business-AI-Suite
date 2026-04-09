import { Link, useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { useGetMe, getGetMeQueryKey } from "@workspace/api-client-react";

import { clearToken } from "@/lib/auth";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarItem, SidebarSection } from "@/components/ui/sidebar";
import { TopBar } from "@/components/ui/top-bar";
import { Icons } from "@/components/ui/icons";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Icons.LayoutDashboard },
  { href: "/clients", label: "Clients", icon: Icons.Users },
  { href: "/deals", label: "Deals", icon: Icons.Briefcase },
  { href: "/tasks", label: "Tasks", icon: Icons.CheckSquare },
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
      {/* Sidebar */}
      <Sidebar className="w-56 flex-shrink-0">
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b border-sidebar-border">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-sidebar-primary shadow-sm">
            <Icons.Zap size={14} className="text-white" />
          </div>
          <span className="text-[13px] font-semibold text-white tracking-tight">
            AI Business OS
          </span>
        </div>

        {/* Navigation */}
        <SidebarSection label="Workspace">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = location === href || location.startsWith(href + "/");
            return (
              <SidebarItem
                key={href}
                href={href}
                isActive={isActive}
                icon={<Icon size={15} />}
              >
                {label}
              </SidebarItem>
            );
          })}
        </SidebarSection>

        {/* Bottom buttons */}
        <div className="mt-auto p-2 space-y-0.5 border-t border-sidebar-border">
          <Button variant="ghost" className="w-full justify-start">
            <Icons.Settings size={15} />
            <span>Settings</span>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={handleLogout}
            data-testid="button-logout"
          >
            <Icons.LogOut size={15} />
            <span>Sign out</span>
          </Button>
        </div>

        {/* User profile */}
        {me && (
          <div className="flex items-center gap-2.5 px-4 py-3.5 border-t border-sidebar-border">
            <Avatar>{getInitials(me.name)}</Avatar>
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
      </Sidebar>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <TopBar
          title={
            navItems.find(
              (n) => location === n.href || location.startsWith(n.href + "/")
            )?.label ?? "Dashboard"
          }
          actions={
            <>
              <Button variant="icon" className="w-8 h-8">
                <Icons.Bell size={16} />
              </Button>
              {me && <Avatar size="sm">{getInitials(me.name)}</Avatar>}
            </>
          }
        />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
