"use client";

import { useCallback, useState, useEffect } from "react";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Flame, Swords, Trophy, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { NavbarNotificationRow } from "@/lib/navbar-notifications";
import { cn } from "@/lib/utils";

function typeIcon(type: string) {
  switch (type) {
    case "achievement_earned":
      return Trophy;
    case "battle_invite":
      return Swords;
    case "clan_war_started":
      return Users;
    default:
      return Flame;
  }
}

type Props = {
  initialItems: NavbarNotificationRow[];
  initialUnreadCount: number;
};

export function NotificationBell({ initialItems, initialUnreadCount }: Props) {
  const [items, setItems] = useState(initialItems);
  const [unreadCount, setUnreadCount] = useState(initialUnreadCount);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const refresh = useCallback(async () => {
    const supabase = createClient();
    const user = userId ? { id: userId, email: "" } : null;
    if (!user) return;

    const { data: rows, error } = await supabase
      .from("notifications")
      .select("id, type, title, body, link, read_at, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (!error && rows) {
      setItems(rows as NavbarNotificationRow[]);
    }

    const { count } = await supabase
      .from("notifications")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);

    setUnreadCount(count ?? 0);
  }, [userId]);

  async function markRead(id: string) {
    const supabase = createClient();
    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("id", id);
    setItems((prev) => {
      const wasUnread = prev.some((n) => n.id === id && !n.read_at);
      if (wasUnread) {
        setUnreadCount((c) => Math.max(0, c - 1));
      }
      return prev.map((n) => (n.id === id ? { ...n, read_at: now } : n));
    });
  }

  async function markAllRead() {
    const supabase = createClient();
    const user = userId ? { id: userId, email: "" } : null;
    if (!user) return;
    const now = new Date().toISOString();
    await supabase
      .from("notifications")
      .update({ read_at: now })
      .eq("user_id", user.id)
      .is("read_at", null);
    setItems((prev) => prev.map((n) => ({ ...n, read_at: n.read_at ?? now })));
    setUnreadCount(0);
  }

  return (
    <DropdownMenu
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next) void refresh();
      }}
    >
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="relative rounded-full p-2 hover:bg-muted"
          aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        >
          <Bell className="h-5 w-5 text-heading" />
          {unreadCount > 0 ? (
            <span
              className={cn(
                "absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#534AB7] px-1 text-[10px] font-bold text-white"
              )}
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="z-50 w-[min(100vw-2rem,22rem)] max-h-[min(70vh,24rem)] overflow-y-auto rounded-xl p-0"
      >
        <DropdownMenuLabel className="px-3 py-2 text-heading">
          Notifications
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Nothing yet. Earn achievements, check battle labs, or watch for clan
            season updates.
          </p>
        ) : (
          items.map((n) => {
            const Icon = typeIcon(n.type);
            const href = n.link?.trim() || "/achievements";
            const isUnread = !n.read_at;
            return (
              <DropdownMenuItem
                key={n.id}
                asChild
                className={cn(
                  "cursor-pointer rounded-none px-3 py-2.5 focus:bg-accent",
                  isUnread && "bg-[#534AB7]/5 dark:bg-[#534AB7]/10"
                )}
              >
                <Link
                  href={href}
                  className="flex gap-3"
                  onClick={() => void markRead(n.id)}
                >
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted">
                    <Icon className="h-4 w-4 text-[#534AB7]" />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="text-sm font-semibold leading-snug text-heading">
                      {n.title}
                    </p>
                    {n.body ? (
                      <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                        {n.body}
                      </p>
                    ) : null}
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      {new Date(n.created_at).toLocaleString()}
                    </p>
                  </div>
                </Link>
              </DropdownMenuItem>
            );
          })
        )}
        {items.length > 0 ? (
          <>
            <DropdownMenuSeparator />
            <div className="p-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-full text-xs"
                onClick={(e) => {
                  e.preventDefault();
                  void markAllRead();
                }}
              >
                Mark all read
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-1 h-8 w-full text-xs"
                asChild
              >
                <Link href="/achievements">Open achievements</Link>
              </Button>
            </div>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
