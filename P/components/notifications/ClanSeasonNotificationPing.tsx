"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyClanWarStarted } from "@/lib/notifications";

const SESSION_KEY = "smartlab_clan_season_nudge_v1";

/**
 * One notification per browser session on leaderboard — stands in for a real
 * "clan war started" broadcast (e.g. Edge Function or cron).
 */
export function ClanSeasonNotificationPing() {
  const ran = useRef(false);
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  useEffect(() => {
    if (ran.current) return;
    if (typeof window === "undefined") return;
    if (sessionStorage.getItem(SESSION_KEY)) return;
    ran.current = true;

    (async () => {
      const supabase = createClient();
      
  const user = userId ? { id: userId, email: "" } : null;
      if (!user) return;
      await notifyClanWarStarted(
        supabase,
        user.id,
        "Clan season prep",
        "Rankings update as you finish lab quizzes — full clan wars will use this board.",
        "/leaderboard"
      );
      sessionStorage.setItem(SESSION_KEY, "1");
    })();
  }, []);

  return null;
}
