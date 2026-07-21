"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Bot,
  LogOut,
  Trophy,
  Users,
  Zap,
  Medal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const items = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/labs", label: "Subjects", icon: BookOpen },
  { href: "/ai-tutor", label: "AI Tutor", icon: Bot },
  { href: "/quiz/demo", label: "Quizzes", icon: Medal },
  { href: "/labs/simulation/cpu-scheduling", label: "Battles", icon: Zap },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/achievements", label: "Achievements", icon: Users },
];

export type UserSidebarContentProps = {
  userName: string;
  tagline?: string;
  avatarPublicUrl?: string | null;
  /** Called when a nav link is activated (e.g. close mobile sheet). */
  onNavigate?: () => void;
};

/**
 * Inner nav for student sidebar — used in desktop aside and mobile Sheet.
 */
export function UserSidebarContent({
  userName,
  tagline = "Sophisticated Mentor",
  avatarPublicUrl,
  onNavigate,
}: UserSidebarContentProps) {
  const pathname = usePathname();
  const supabase = createClient();

  return (
    <>
      <div className="flex items-center gap-3 px-6 py-8">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
          <LayoutDashboard className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm font-bold leading-tight">HNDIT Lab</p>
          <p className="text-[10px] uppercase tracking-wide text-white/70">
            {tagline}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3">
        {items.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-white text-[#534AB7] shadow-md"
                  : "text-white/90 hover:bg-white/10"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-3 p-4">
        <Button
          asChild
          className="w-full rounded-xl bg-white font-semibold text-[#534AB7] hover:bg-white/90"
        >
          <Link
            href="/quiz/demo"
            className="flex items-center justify-center gap-2"
            onClick={() => onNavigate?.()}
          >
            <Zap className="h-4 w-4" /> Daily Challenge
          </Link>
        </Button>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-3 px-2">
            <Avatar className="h-10 w-10 border-2 border-white/30">
              {avatarPublicUrl ? (
                <AvatarImage src={avatarPublicUrl} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-white/10 text-white text-sm">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-white/60">Signed in as</p>
              <p className="truncate text-sm font-semibold">{userName}</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="block rounded-lg px-2 py-1 text-white/80 hover:bg-white/10"
            onClick={() => onNavigate?.()}
          >
            Profile
          </Link>
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-1 text-sm text-red-400 hover:bg-white/10 transition-colors"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>
      </div>
    </>
  );
}

type SidebarProps = UserSidebarContentProps;

/**
 * Student sidebar — desktop only below `md`; use Sheet + UserSidebarContent on small screens.
 */
export function UserSidebar(props: SidebarProps) {
  return (
    <aside
      className={cn(
        "sidebar-gradient sticky top-0 z-30 hidden h-screen w-64 shrink-0 flex-col overflow-y-auto border-r border-white/10 text-white shadow-lg md:flex"
      )}
    >
      <UserSidebarContent {...props} />
    </aside>
  );
}
