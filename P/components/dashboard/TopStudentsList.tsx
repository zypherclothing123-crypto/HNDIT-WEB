"use client";

import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export type TopStudent = {
  userId: string;
  rank: number;
  name: string;
  xp: number;
  avatarUrl: string | null;
  isYou?: boolean;
};

type Props = {
  students: TopStudent[];
};

export function TopStudentsList({ students }: Props) {
  if (!students.length) {
    return (
      <div className="rounded-2xl border bg-card p-5 shadow-soft">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-bold text-heading">Top Students</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No rankings yet — complete a lab quiz to appear here.
        </p>
        <motion.a
          href="/labs"
          className="mt-4 block w-full rounded-xl border border-[#534AB7]/30 py-2 text-center text-sm font-semibold text-[#534AB7] hover:bg-[#534AB7]/5"
          whileTap={{ scale: 0.98 }}
        >
          Browse labs
        </motion.a>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-bold text-heading">Top Students</h3>
      </div>
      <ul className="space-y-3">
        {students.map((s, i) => (
          <motion.li
            key={s.userId}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className={`flex items-center gap-3 rounded-xl px-2 py-2 ${
              s.isYou ? "bg-[#534AB7]/10 ring-1 ring-[#534AB7]/20" : ""
            }`}
          >
            <span className="w-6 text-sm font-bold text-heading">
              {s.rank === 1 ? (
                <Star className="h-5 w-5 fill-amber-400 text-amber-500" />
              ) : (
                s.rank
              )}
            </span>
            <Avatar className="h-9 w-9">
              {s.avatarUrl ? (
                <AvatarImage src={s.avatarUrl} alt="" className="object-cover" />
              ) : null}
              <AvatarFallback>{s.name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="text-sm font-semibold text-heading">
                {s.name}
                {s.isYou ? " (You)" : ""}
              </p>
              <p className="text-xs text-muted-foreground">{s.xp.toLocaleString()} XP</p>
            </div>
          </motion.li>
        ))}
      </ul>
      <motion.a
        href="/leaderboard"
        className="mt-4 block w-full rounded-xl border border-[#534AB7]/30 py-2 text-center text-sm font-semibold text-[#534AB7] hover:bg-[#534AB7]/5"
        whileTap={{ scale: 0.98 }}
      >
        Full Leaderboard
      </motion.a>
    </div>
  );
}
