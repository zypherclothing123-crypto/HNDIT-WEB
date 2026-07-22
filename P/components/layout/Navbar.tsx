"use client";

import { Settings, Menu } from "lucide-react";
import { NavbarSearch } from "@/components/layout/NavbarSearch";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { NotificationBell } from "@/components/layout/NotificationBell";
import type { NavbarNotificationRow } from "@/lib/navbar-notifications";

type Variant = "user" | "admin";

type Props = {
  variant?: Variant;
  title?: string;
  subtitle?: string;
  searchPlaceholder?: string;
  userName: string;
  userRole: string;
  /** Resolved public URL for profile photo (from `profiles.avatar_url`). */
  avatarPublicUrl?: string | null;
  notificationItems?: NavbarNotificationRow[];
  notificationUnreadCount?: number;
  /** Mobile: opens left navigation sheet (sidebar is off-canvas below `md`). */
  onOpenMobileNav?: () => void;
};

export function Navbar({
  variant = "user",
  title,
  subtitle,
  searchPlaceholder = "Search courses, mentors, materials...",
  userName,
  userRole,
  avatarPublicUrl,
  notificationItems = [],
  notificationUnreadCount = 0,
  onOpenMobileNav,
}: Props) {
  const adminSearch =
    variant === "admin" ? "Search resources..." : searchPlaceholder;

  return (
    <header className="sticky top-0 z-40 border-b border-white/50 bg-white/80 backdrop-blur-md dark:border-white/10 dark:bg-[#05131e]/85">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 md:flex-row md:items-center md:justify-between lg:px-8">
        {title ? (
          <div>
            <p className="text-xs font-bold uppercase tracking-wide text-[#005581]">
              {subtitle}
            </p>
            <h1 className="text-xl font-bold text-heading">{title}</h1>
          </div>
        ) : null}

        <NavbarSearch variant={variant} placeholder={adminSearch} />

        <div className="flex items-center justify-end gap-2">
          {onOpenMobileNav ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="shrink-0 md:hidden"
              aria-label="Open menu"
              onClick={onOpenMobileNav}
            >
              <Menu className="h-5 w-5 text-heading" />
            </Button>
          ) : null}
          <ThemeToggle />
          <NotificationBell
            initialItems={notificationItems}
            initialUnreadCount={notificationUnreadCount}
          />
          <Link
            href="/profile"
            className="rounded-full p-2 hover:bg-muted"
            aria-label="Profile and account settings"
          >
            <Settings className="h-5 w-5 text-heading" />
          </Link>

        </div>
      </div>
    </header>
  );
}
