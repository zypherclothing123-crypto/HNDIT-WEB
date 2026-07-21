"use client";

import { motion } from "framer-motion";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry } from "@/lib/leaderboard-stats";
import {
  levelFromXp,
  podiumTitle,
  rankForUser,
} from "@/lib/leaderboard-stats";

type PodiumRow = LeaderboardEntry & { rank: number };

function EntryAvatar(props: {
  name: string;
  avatarUrl: string | null;
  className?: string;
  fallbackClassName?: string;
}) {
  const { name, avatarUrl, className, fallbackClassName } = props;
  return (
    <Avatar className={className}>
      {avatarUrl ? (
        <AvatarImage src={avatarUrl} alt="" className="object-cover" />
      ) : null}
      <AvatarFallback className={fallbackClassName}>
        {name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

function buildPodium(entries: LeaderboardEntry[]): PodiumRow[] {
  if (entries.length >= 3) {
    return [
      { ...entries[1], rank: 2 },
      { ...entries[0], rank: 1 },
      { ...entries[2], rank: 3 },
    ];
  }
  if (entries.length === 2) {
    return [
      { ...entries[1], rank: 2 },
      { ...entries[0], rank: 1 },
    ];
  }
  if (entries.length === 1) {
    return [{ ...entries[0], rank: 1 }];
  }
  return [];
}

type Props = {
  entries: LeaderboardEntry[];
  currentUserId: string;
};

export function LeaderboardView({ entries, currentUserId }: Props) {
  const podium = buildPodium(entries);
  const rest = entries.slice(3);
  const yourRank = rankForUser(entries, currentUserId);
  const you = entries.find((e) => e.userId === currentUserId);
  const youLevel = you ? levelFromXp(you.totalXp).level : 1;

  if (!entries.length) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 rounded-2xl border bg-card p-10 text-center shadow-soft">
        <h1 className="text-2xl font-bold text-heading">The Arena</h1>
        <p className="text-sm text-muted-foreground">
          No scores yet. Complete a lab quiz to appear on the leaderboard and
          inspire your batchmates.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-10">
      <header className="space-y-2">
        <p className="text-sm font-semibold text-[#534AB7]">
          HNDIT Learning Lab
        </p>
        <h1 className="text-3xl font-bold text-heading">The Arena</h1>
        <p className="text-sm text-muted-foreground max-w-xl">
          Rankings from lab quiz scores across the cohort.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="rounded-full">
            Student Rankings
          </Badge>
        </div>
      </header>

      <section className="flex flex-wrap items-end justify-center gap-4">
        {podium.map((p, i) => {
          const height =
            p.rank === 1 ? "h-52" : p.rank === 2 ? "h-44" : "h-36";
          const border =
            p.rank === 1
              ? "border-amber-400"
              : p.rank === 2
                ? "border-gray-300"
                : "border-orange-700";
          const lvl = levelFromXp(p.totalXp).level;
          return (
            <motion.div
              key={p.userId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i }}
              className={`flex w-40 flex-col items-center rounded-2xl border-2 bg-card shadow-soft ${border} ${height}`}
            >
              <div className="mt-4 text-sm font-bold text-heading">
                {p.rank === 1 ? "⭐1" : p.rank}
              </div>
              <EntryAvatar
                name={p.displayName}
                avatarUrl={p.avatarUrl}
                className="mt-3 h-14 w-14 border-2 border-white shadow"
                fallbackClassName="text-xs"
              />
              <p className="mt-2 line-clamp-2 text-center text-sm font-semibold">
                {p.displayName}
              </p>
              <p className="text-xs text-muted-foreground">Level {lvl}</p>
              <p className="text-xs font-semibold text-[#534AB7]">
                {podiumTitle(p.rank)}
              </p>
              <p className="mt-auto mb-4 text-xs font-bold">
                {p.totalXp.toLocaleString()} XP
              </p>
            </motion.div>
          );
        })}
      </section>

      <section className="space-y-3">
        {you ? (
          <div className="rounded-2xl border bg-[#534AB7]/10 p-4">
            <div className="flex items-start gap-3">
              <EntryAvatar
                name={you.displayName}
                avatarUrl={you.avatarUrl}
                className="h-12 w-12 border border-[#534AB7]/30"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-[#534AB7]">You</p>
                <p className="text-lg font-bold text-heading">
                  #{yourRank} · {you.displayName}
                </p>
                <p className="text-sm text-muted-foreground">
                  Level {youLevel} · {you.totalXp.toLocaleString()} XP ·{" "}
                  {you.labsCompleted} labs completed
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {rest.map((row, i) => {
          const rank = 4 + i;
          const lvl = levelFromXp(row.totalXp).level;
          return (
            <div
              key={row.userId}
              className="flex flex-wrap items-center justify-between rounded-2xl border bg-card p-4 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-bold">{rank}</span>
                <EntryAvatar name={row.displayName} avatarUrl={row.avatarUrl} />
                <div>
                  <p className="font-semibold">{row.displayName}</p>
                  <p className="text-xs text-muted-foreground">
                    LEVEL {lvl}
                  </p>
                </div>
              </div>
              <div className="text-right text-sm">
                <p className="font-semibold">
                  {row.totalXp.toLocaleString()} XP
                </p>
              </div>
            </div>
          );
        })}
      </section>
    </div>
  );
}
