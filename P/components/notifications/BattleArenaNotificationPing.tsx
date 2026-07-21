"use client";

import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { notifyBattleInvite } from "@/lib/notifications";

const SESSION_KEY = "smartlab_battle_cpu_nudge_v1";

/**
 * One notification per browser session when a learner opens the battle-style lab.
 * Replace with real matchmaking / invites when that ships.
 */
export function BattleArenaNotificationPing() {
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
      await notifyBattleInvite(
        supabase,
        user.id,
        "Battle practice: CPU scheduling",
        "Sharpen Gantt skills here — clan duels and friend invites are on the roadmap.",
        "/labs/simulation/cpu-scheduling"
      );
      sessionStorage.setItem(SESSION_KEY, "1");
    })();
  }, []);

  return null;
}
