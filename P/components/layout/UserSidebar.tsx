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
  { href: "/labs/simulation/cpu-scheduling", label: "Labs", icon: Zap },
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
      <div className="flex justify-center px-6 py-8 mb-2">
        <img src="/hnditlogo.png" alt="HNDIT Logo" className="h-16 w-auto object-contain drop-shadow-md" />
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {items.map((item) => {
          const active = item.href === "/labs"
            ? pathname === "/labs" || (pathname.startsWith("/labs/") && !pathname.startsWith("/labs/simulation"))
            : pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-[#ffd200] text-[#001824] shadow-md shadow-[#ffd200]/20"
                  : "text-white/80 hover:bg-white/10 hover:text-white"
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
          className="w-full rounded-xl bg-[#ffd200] font-semibold text-[#001824] hover:bg-[#ffe552] transition-colors py-5 shadow-md shadow-[#ffd200]/20"
        >
          <Link
            href="/quiz/demo"
            className="flex items-center justify-center gap-2"
            onClick={() => onNavigate?.()}
          >
            <Zap className="h-4 w-4" /> Daily Challenge
          </Link>
        </Button>
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-4 mb-3">
            <Avatar className="h-10 w-10 border-2 border-[#ffd200]/50 shadow-sm">
              {avatarPublicUrl ? (
                <AvatarImage src={avatarPublicUrl} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback className="bg-white/10 text-white text-sm">
                {userName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-xs text-[#72CDF4]">Signed in as</p>
              <p className="truncate text-sm font-semibold">{userName}</p>
            </div>
          </div>
          <Link
            href="/profile"
            className="flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-[#ffd200] transition-colors"
            onClick={() => onNavigate?.()}
          >
            <Users className="h-5 w-5" /> Profile
          </Link>
          <button
            type="button"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-red-400 hover:bg-red-400/10 hover:text-red-300 transition-colors"
          >
            <LogOut className="h-5 w-5" /> Sign out
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
