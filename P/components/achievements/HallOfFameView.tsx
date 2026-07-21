"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Star, Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { AchievementCatalogEntry } from "@/lib/achievement-catalog";
import type { UserCollectionStats } from "@/lib/student-stats";

export type EarnedBadge = {
  title: string;
  description: string | null;
  badge_icon: string | null;
  earned_at: string;
};

function rarityClasses(r: string) {
  if (r === "LEGENDARY") {
    return "border-amber-400/80 bg-gradient-to-br from-amber-50 via-white to-amber-100 shadow-[0_0_32px_rgba(251,191,36,0.35)]";
  }
  if (r === "EPIC") {
    return "border-[#534AB7]/70 bg-gradient-to-br from-[#534AB7]/10 via-white to-[#6dd5ed]/10";
  }
  if (r === "RARE") {
    return "border-blue-400/70 bg-gradient-to-br from-blue-50 to-white";
  }
  return "border-gray-200 bg-card";
}

function iconForBadge(raw: string | null) {
  switch (raw) {
    case "trophy":
      return Trophy;
    case "star":
      return Star;
    case "zap":
      return Zap;
    default:
      return Trophy;
  }
}

type Props = {
  earned: EarnedBadge[];
  totalXp: number;
  displayName?: string;
  avatarPublicUrl?: string | null;
  locked: AchievementCatalogEntry[];
  collections: UserCollectionStats;
};

export function HallOfFameView({
  earned,
  totalXp,
  displayName = "Learner",
  avatarPublicUrl,
  locked,
  collections,
}: Props) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_280px]">
      <div className="space-y-8">
        <header className="space-y-3">
          <div className="flex flex-wrap items-center gap-4">
            <Avatar className="h-14 w-14 border-2 border-[#534AB7]/25 shadow-sm">
              {avatarPublicUrl ? (
                <AvatarImage
                  src={avatarPublicUrl}
                  alt=""
                  className="object-cover"
                />
              ) : null}
              <AvatarFallback className="text-sm font-bold">
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h1 className="text-4xl font-bold text-heading">Hall of Fame</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {totalXp.toLocaleString()} quiz XP · {earned.length} achievement
              {earned.length !== 1 ? "s" : ""} unlocked
            </p>
            <span className="rounded-full bg-[#534AB7]/15 px-3 py-1 text-xs font-semibold text-[#534AB7]">
              Live from your profile
            </span>
          </div>
          <Tabs defaultValue="all">
            <TabsList className="rounded-2xl">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="quiz">Quiz</TabsTrigger>
              <TabsTrigger value="simulation">Simulation</TabsTrigger>
              <TabsTrigger value="battle">Battle</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {earned.map((a, i) => {
                  const Icon = iconForBadge(a.badge_icon);
                  return (
                    <motion.div
                      key={`${a.title}-${a.earned_at}`}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * i }}
                      whileHover={{ scale: 1.02 }}
                      className={`relative overflow-hidden rounded-2xl border p-5 shadow-soft ${rarityClasses(
                        "LEGENDARY"
                      )}`}
                    >
                      <span className="absolute right-4 top-4 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Earned
                      </span>
                      <div className="mt-6 flex flex-col items-center text-center">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#534AB7]/10 text-[#534AB7]">
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-heading">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {a.description ?? ""}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-[#534AB7]">
                          {new Date(a.earned_at).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
                {locked.map((a, i) => {
                  return (
                    <motion.div
                      key={a.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * (earned.length + i) }}
                      whileHover={{ scale: 1 }}
                      className={`relative overflow-hidden rounded-2xl border p-5 shadow-soft ${rarityClasses(
                        a.rarity
                      )} opacity-80 grayscale`}
                    >
                      <span className="absolute right-4 top-4 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {a.rarity}
                      </span>
                      <div className="mt-6 flex flex-col items-center text-center">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#534AB7]/10 text-[#534AB7]">
                          <Lock className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-heading">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {a.description}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-[#534AB7]">
                          +{a.xp} XP · LOCKED
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>
        </header>
      </div>

      <aside className="h-fit space-y-5 rounded-2xl border bg-card p-5 shadow-soft">
        <h2 className="text-lg font-bold text-heading">Collections</h2>
        {[
          {
            label: "Achievements",
            value: collections.achievementsEarned,
            max: collections.achievementsTotal,
            tone: "bg-[#534AB7]",
          },
          {
            label: "Labs completed",
            value: collections.labsCompleted,
            max: Math.max(collections.labsTotal, 1),
            tone: "bg-[#1D9E75]",
          },
          {
            label: "Still to unlock",
            value: Math.max(
              0,
              collections.achievementsTotal - collections.achievementsEarned
            ),
            max: collections.achievementsTotal,
            tone: "bg-[#EF9F27]",
          },
        ].map((c) => (
          <div key={c.label} className="space-y-1">
            <div className="flex justify-between text-xs font-semibold text-muted-foreground">
              <span>{c.label}</span>
              <span>
                {c.value}/{c.max}
              </span>
            </div>
            <Progress value={(c.value / c.max) * 100} className="h-2" />
          </div>
        ))}
        <div className="rounded-2xl bg-[#F8F7FF] p-4 dark:bg-[#1a1a2e]">
          <p className="text-sm font-semibold text-heading">Next step</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete more lab quizzes to unlock rare badges automatically.
          </p>
          <Button asChild className="mt-3 w-full rounded-xl">
            <Link href="/labs">Go to Labs</Link>
          </Button>
        </div>
      </aside>
    </div>
  );
}
