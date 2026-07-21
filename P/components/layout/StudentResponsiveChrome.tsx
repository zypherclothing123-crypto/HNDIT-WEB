"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { UserSidebar, UserSidebarContent } from "@/components/layout/UserSidebar";
import { Navbar } from "@/components/layout/Navbar";
import type { NavbarNotificationRow } from "@/lib/navbar-notifications";

type Props = {
  userName: string;
  avatarPublicUrl: string | null;
  notificationItems: NavbarNotificationRow[];
  notificationUnreadCount: number;
  children: React.ReactNode;
};

export function StudentResponsiveChrome({
  userName,
  avatarPublicUrl,
  notificationItems,
  notificationUnreadCount,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="page-shell flex min-h-screen items-start">
      <UserSidebar userName={userName} avatarPublicUrl={avatarPublicUrl} />
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent
          side="left"
          hideClose
          className="sidebar-gradient z-[60] w-[min(100vw,16rem)] max-w-[85vw] border-r border-white/10 p-0 text-white md:hidden"
        >
          <SheetTitle className="sr-only">Main navigation menu</SheetTitle>
          <div className="flex h-full max-h-[100dvh] flex-col overflow-y-auto">
            <UserSidebarContent
              userName={userName}
              avatarPublicUrl={avatarPublicUrl}
              onNavigate={() => setMobileOpen(false)}
            />
          </div>
        </SheetContent>
      </Sheet>
      <div className="flex min-h-screen min-w-0 flex-1 flex-col">
        <Navbar
          userName={userName}
          userRole="HNDIT Level 2"
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
