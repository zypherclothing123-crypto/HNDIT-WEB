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
        "flex w-64 shrink-0 flex-col overflow-y-auto border-r bg-white shadow-soft dark:border-white/10 dark:bg-[#2d2d44]",
        "md:sticky md:top-0 md:z-30 md:h-screen",
        className
      )}
    >
      <div className="flex items-start gap-3 px-5 py-8">
        <img src="/hnditlogo.png" alt="HNDIT Logo" className="h-16 w-auto object-contain rounded-full" />
        <div>
          <p className="text-xs font-bold uppercase tracking-wide text-[#534AB7]">
            Admin Panel
          </p>
          <p className="text-[11px] font-semibold text-muted-foreground">
            Management Console
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-0.5 px-3">
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
                "flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors",
                active
                  ? "bg-[#F3F0FF] text-[#534AB7] dark:bg-white/10"
                  : "text-heading hover:bg-muted"
              )}
            >
              <Icon className="h-4 w-4 text-[#534AB7]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 space-y-3">
        <Button className="w-full gap-2 rounded-xl" asChild>
          <Link href="/admin/subjects" onClick={() => onNavigate?.()}>
            <Plus className="h-4 w-4" /> New Course
          </Link>
        </Button>
        <button
          type="button"
          className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.href = "/";
          }}
        >
          <LogOut className="h-4 w-4" /> Logout
        </button>
      </div>
    </aside>
  );
}
