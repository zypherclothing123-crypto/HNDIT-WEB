"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { levelFromXp } from "@/lib/leaderboard-stats";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, Sparkles, Trophy, Database } from "lucide-react";
import { useRouter } from "next/navigation";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
  totalXp: number;
  labsCompleted: number;
};

export function UserTable() {
  const supabase = createClient();
  const router = useRouter();
  const [rows, setRows] = useState<ProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    // 1. Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .order("created_at", { ascending: false });

    if (!profiles) return;

    // 2. Fetch progress to calculate XP and Labs Completed
    const { data: progress } = await supabase
      .from("user_progress")
      .select("user_id, score, completed");

    const byUser = new Map<string, { xp: number; labs: number }>();
    if (progress) {
      for (const row of progress) {
        const uid = row.user_id;
        if (!uid) continue;
        const cur = byUser.get(uid) ?? { xp: 0, labs: 0 };
        cur.xp += row.score ?? 0;
        if (row.completed) cur.labs += 1;
        byUser.set(uid, cur);
      }
    }

    const merged = profiles.map((p) => {
      const stats = byUser.get(p.id) ?? { xp: 0, labs: 0 };
      return {
        ...p,
        totalXp: stats.xp,
        labsCompleted: stats.labs,
      };
    });

    setRows(merged);
    setLoading(false);
  }

  // Real-time polling every 10 seconds (client-side only)
  useEffect(() => {
    void load();
    const interval = setInterval(() => {
      void load();
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

  async function toggleAdmin(id: string, toAdmin: boolean) {
    await supabase
      .from("profiles")
      .update({ role: toAdmin ? "admin" : "user" })
      .eq("id", id);
    await load();
  }

  if (loading) {
    return <div className="py-10 text-center text-sm text-muted-foreground animate-pulse">Loading students...</div>;
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <AnimatePresence>
        {rows.map((r, i) => {
          const label = r.full_name?.trim() || r.email?.split("@")[0] || "Learner";
          const initials = label.slice(0, 2).toUpperCase();
          const avatarSrc = profileAvatarPublicUrl(supabase, r.avatar_url);
          const { level } = levelFromXp(r.totalXp);
          const isAdmin = r.role === "admin";

          // Dynamic colors based on rank/admin
          const glowClass = isAdmin 
            ? "hover:border-[#ffd200] hover:shadow-[0_0_20px_rgba(255,210,0,0.3)]" 
            : "hover:border-[#72CDF4] hover:shadow-[0_0_15px_rgba(114,205,244,0.3)]";

          return (
            <motion.div
              key={r.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ delay: 0.05 * i, type: "spring", stiffness: 300 }}
              className={`relative overflow-hidden flex flex-col rounded-3xl border-2 border-white/20 bg-white/80 p-6 shadow-lg backdrop-blur-xl transition-all dark:border-white/10 dark:bg-[#05131e]/90 ${glowClass}`}
            >
              <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-gradient-to-br from-[#72CDF4]/20 to-transparent blur-2xl" />
              
              <div className="flex items-start justify-between">
                <Avatar className="h-16 w-16 border-2 border-white shadow-md dark:border-[#0a1f2e]">
                  {avatarSrc ? (
                    <AvatarImage src={avatarSrc} alt="" className="object-cover" />
                  ) : null}
                  <AvatarFallback className="bg-slate-100 text-slate-500 font-bold dark:bg-[#0a1f2e] dark:text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-muted-foreground">Admin</span>
                    <Switch
                      checked={isAdmin}
                      onCheckedChange={(v) => void toggleAdmin(r.id, v)}
                      className="data-[state=checked]:bg-[#ffd200]"
                    />
                  </div>
                  {isAdmin && (
                    <span className="flex items-center gap-1 rounded-full bg-[#ffd200]/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-[#b39300] dark:text-[#ffd200]">
                      <Shield className="h-3 w-3" /> Staff
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-5 mb-6">
                <h3 className="truncate text-lg font-bold text-heading">{label}</h3>
                <p className="truncate text-xs text-muted-foreground">{r.email}</p>
              </div>

              <div className="mt-auto grid grid-cols-2 gap-3 rounded-2xl bg-slate-50 p-3 dark:bg-white/5">
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                    <Sparkles className="h-3 w-3 text-[#72CDF4]" /> Level
                  </span>
                  <span className="text-base font-bold text-[#72CDF4]">{level}</span>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                    <Trophy className="h-3 w-3 text-[#ffd200]" /> XP
                  </span>
                  <span className="text-base font-bold text-heading">{r.totalXp.toLocaleString()}</span>
                </div>
                <div className="col-span-2 flex flex-col gap-1">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-muted-foreground">
                    <Database className="h-3 w-3 text-[#005581]" /> Labs Completed
                  </span>
                  <span className="text-base font-bold text-[#005581]">{r.labsCompleted}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
