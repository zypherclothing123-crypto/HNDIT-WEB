"use client";

import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lock, Star, Trophy, Zap } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ACHIEVEMENT_CATALOG } from "@/lib/achievement-catalog";
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
    return "border-[#ffd200] bg-gradient-to-br from-[#ffd200]/20 via-white to-[#ffd200]/10 shadow-[0_0_32px_rgba(255,210,0,0.4)] dark:from-[#ffd200]/10 dark:via-[#0a1f2e] dark:to-[#05131e]";
  }
  if (r === "EPIC") {
    return "border-[#005581] bg-gradient-to-br from-[#005581]/15 via-white to-[#72CDF4]/20 shadow-[0_0_24px_rgba(0,85,129,0.3)] dark:from-[#005581]/20 dark:via-[#0a1f2e] dark:to-[#05131e]";
  }
  if (r === "RARE") {
    return "border-[#72CDF4] bg-gradient-to-br from-[#72CDF4]/20 to-white shadow-[0_0_20px_rgba(114,205,244,0.2)] dark:to-[#0a1f2e]";
  }
  return "border-slate-200 bg-white dark:border-white/10 dark:bg-[#0a1f2e]";
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
            <Avatar className="h-14 w-14 border-2 border-[#005581]/25 shadow-sm">
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
            <span className="rounded-full bg-[#005581]/15 px-3 py-1 text-xs font-semibold text-[#005581]">
              Live from your profile
            </span>
          </div>
          <Tabs defaultValue="all">
            <TabsList className="rounded-2xl">
              <TabsTrigger value="all" className="data-[state=active]:bg-[#72CDF4] data-[state=active]:text-white">All</TabsTrigger>
              <TabsTrigger value="quiz" className="data-[state=active]:bg-[#72CDF4] data-[state=active]:text-white">Quiz</TabsTrigger>
              <TabsTrigger value="simulation" className="data-[state=active]:bg-[#72CDF4] data-[state=active]:text-white">Simulation</TabsTrigger>
              <TabsTrigger value="battle" className="data-[state=active]:bg-[#72CDF4] data-[state=active]:text-white">Battle</TabsTrigger>
            </TabsList>
            
            {["all", "quiz", "simulation", "battle"].map((tab) => {
              // Helper category function
              const getCategory = (title: string) => {
                if (title === "HNDIT Star") return "battle";
                if (title === "Subject Master") return "simulation";
                return "quiz";
              };

              const filteredEarned = tab === "all" ? earned : earned.filter(a => getCategory(a.title) === tab);
              const filteredLocked = tab === "all" ? locked : locked.filter(a => getCategory(a.title) === tab);

              return (
                <TabsContent key={tab} value={tab} className="mt-6">
                  {filteredEarned.length === 0 && filteredLocked.length === 0 ? (
                    <div className="py-12 text-center text-muted-foreground">
                      No achievements found in this category.
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                      {filteredEarned.map((a, i) => {
                  const cat = ACHIEVEMENT_CATALOG.find((c) => c.title === a.title);
                  const rarity = cat?.rarity ?? "COMMON";
                  const Icon = iconForBadge(a.badge_icon);
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={{ scale: 1.05, rotate: 1 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 p-6 text-center transition-shadow hover:shadow-xl ${rarityClasses(
                        rarity
                      )}`}
                    >
                      <span className="absolute right-4 top-4 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        Earned
                      </span>
                      <div className="mt-6 flex flex-col items-center text-center">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#005581]/10 text-[#005581]">
                          <Icon className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-heading">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {a.description ?? ""}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-[#005581]">
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
                {filteredLocked.map((a, i) => {
                  return (
                    <motion.div
                      key={a.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * (earned.length + i) }}
                      whileHover={{ scale: 1.02, opacity: 1 }}
                      className={`relative flex flex-col items-center gap-3 rounded-3xl border-2 p-6 text-center transition-all ${rarityClasses(
                        a.rarity
                      )} opacity-60 grayscale hover:grayscale-[50%]`}
                    >
                      <span className="absolute right-4 top-4 rounded-full bg-black/70 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
                        {a.rarity}
                      </span>
                      <div className="mt-6 flex flex-col items-center text-center">
                        <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-[#005581]/10 text-[#005581]">
                          <Lock className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-bold text-heading">
                          {a.title}
                        </h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                          {a.description}
                        </p>
                        <p className="mt-4 text-xs font-semibold text-[#005581]">
                          +{a.xp} XP · LOCKED
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </TabsContent>
        );
      })}
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
            tone: "bg-[#005581]",
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
        <div className="rounded-2xl bg-[#FFFFFA] p-4 dark:bg-[#05131e]">
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
