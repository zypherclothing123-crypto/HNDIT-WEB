"use client";

import { useState } from "react";
import { AdminSidebar } from "@/components/layout/AdminSidebar";
import { Navbar } from "@/components/layout/Navbar";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import type { NavbarNotificationRow } from "@/lib/navbar-notifications";

type Props = {
  children: React.ReactNode;
  userName: string;
  avatarPublicUrl: string | null;
  navTitle?: string;
  navSubtitle?: string;
  notificationItems?: NavbarNotificationRow[];
  notificationUnreadCount?: number;
};

/**
 * Admin shell: sidebar + top bar + main. Used by `/admin/*` and `/profile` when
 * the signed-in user is an admin. Sidebar is a left Sheet below `md`.
 */
export function AdminAppChrome({
  children,
  userName,
  avatarPublicUrl,
  navTitle = "",
  navSubtitle = "",
  notificationItems = [],
  notificationUnreadCount = 0,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="page-shell flex min-h-screen items-start bg-[#FFFFFA] dark:bg-[#05131e]">
      <AdminSidebar className="hidden md:flex" userName={userName} avatarPublicUrl={avatarPublicUrl} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          hideClose
          className="z-[60] w-[min(100vw,16rem)] max-w-[85vw] border-r p-0 md:hidden"
        >
          <SheetTitle className="sr-only">Admin navigation menu</SheetTitle>
          <AdminSidebar
            className="flex h-full max-h-[100dvh] border-0 shadow-none"
            onNavigate={() => setMobileOpen(false)}
            userName={userName}
            avatarPublicUrl={avatarPublicUrl}
          />
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar
          variant="admin"
          title={navTitle}
          subtitle={navSubtitle}
          userName={userName}
          userRole="System Administrator"
          avatarPublicUrl={avatarPublicUrl}
          notificationItems={notificationItems}
          notificationUnreadCount={notificationUnreadCount}
          onOpenMobileNav={() => setMobileOpen(true)}
        />
        <main className="flex-1 space-y-8 px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
