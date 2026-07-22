"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Upload,
  Users,
  FlaskConical,
  Settings,
  Plus,
  GraduationCap,
  LineChart,
  UserCircle,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

const items = [
  { href: "/admin/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/admin/analytics", label: "Analytics", icon: LineChart },
  { href: "/profile", label: "My profile", icon: UserCircle },
  { href: "/admin/subjects", label: "Subjects", icon: BookOpen },
  { href: "/admin/upload", label: "Content Upload", icon: Upload },
  { href: "/admin/users", label: "Students", icon: Users },
  { href: "/admin/labs", label: "Labs", icon: FlaskConical },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

type Props = {
  /** Close mobile sheet after navigation. */
  onNavigate?: () => void;
  className?: string;
};

export function AdminSidebar({ onNavigate, className }: Props) {
  const pathname = usePathname();
  const supabase = createClient();

  return (
    <aside
      className={cn(
        "flex w-64 shrink-0 flex-col overflow-y-auto border-r bg-white shadow-soft dark:border-white/10 dark:bg-[#0a1f2e]",
        "md:sticky md:top-0 md:z-30 md:h-screen",
        className
      )}
    >
      <div className="flex justify-center px-5 py-8 mb-2">
        <img src="/hnditlogo.png" alt="HNDIT Logo" className="h-16 w-auto object-contain drop-shadow-md" />
      </div>

      <nav className="flex-1 space-y-2 px-4">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/profile" &&
              pathname.startsWith(`${item.href}/`));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => onNavigate?.()}
              className={cn(
                "flex items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200",
                active
                  ? "bg-[#005581] text-white shadow-md shadow-[#005581]/20 dark:bg-[#ffd200] dark:text-[#001824]"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/10 dark:hover:text-white"
              )}
            >
              <Icon className={cn("h-5 w-5", active ? "text-white dark:text-[#001824]" : "text-slate-400 dark:text-slate-500")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <Button className="w-full gap-2 rounded-xl bg-[#005581] text-white hover:bg-[#ffd200] hover:text-[#001824] transition-colors py-5 shadow-md shadow-[#005581]/20" asChild>
          <Link href="/admin/subjects" onClick={() => onNavigate?.()}>
            <Plus className="h-4 w-4" /> New Course
          </Link>
        </Button>
        <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/10">
          <button
            type="button"
            className="flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-semibold text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-400/10 dark:hover:text-red-300 transition-colors"
            onClick={async () => {
              const supabase = createClient();
              await supabase.auth.signOut();
              window.location.href = "/";
            }}
          >
            <LogOut className="h-5 w-5" /> Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
