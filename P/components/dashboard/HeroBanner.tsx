"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CircularProgressRing } from "@/components/dashboard/CircularProgressRing";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type Props = {
  name: string;
  /** Resolved profile photo URL for the current user. */
  avatarPublicUrl?: string | null;
  level: number;
  currentXp: number;
  nextLevelXp: number;
  questTitle?: string;
  questProgress?: number;
  questTotal?: number;
};

/**
 * Gradient hero with Sinhala/English welcome, level ring, resume CTA, today&apos;s quest card.
 * Colors: hero-gradient (#005581 → #72CDF4).
 */
export function HeroBanner({
  name,
  avatarPublicUrl,
  level,
  currentXp,
  nextLevelXp,
  questTitle = "Algorithm Sprint",
  questProgress = 3,
  questTotal = 5,
}: Props) {
  const pct = Math.min(100, Math.round((currentXp / nextLevelXp) * 100));

  return (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="grid gap-6 lg:grid-cols-[1fr_280px]"
    >
      <div className="hero-gradient relative overflow-hidden rounded-3xl p-8 text-white shadow-soft md:p-10">
        <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div className="max-w-xl space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-white/80">
              Welcome Back
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <Avatar className="h-16 w-16 border-2 border-white/40 shadow-lg md:h-20 md:w-20">
                {avatarPublicUrl ? (
                  <AvatarImage
                    src={avatarPublicUrl}
                    alt=""
                    className="object-cover"
                  />
                ) : null}
                <AvatarFallback className="bg-white/20 text-lg font-bold text-white">
                  {name.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <h1 className="text-3xl font-bold md:text-4xl">{name}!</h1>
            </div>
            <p className="text-sm text-white/90 md:text-base">
              Keep your streak alive — pick up the next lab and earn XP toward the
              next level.
            </p>
            <Button
              asChild
              className="rounded-full bg-white px-8 font-semibold text-[#005581] hover:bg-white/90"
            >
              <Link href="/labs">Resume Learning</Link>
            </Button>
          </div>
          <div className="flex justify-center md:justify-end">
            <div className="rounded-2xl bg-black/10 p-4 backdrop-blur-sm">
              <CircularProgressRing
                value={pct}
                label={`LVL ${level}`}
                sublabel={`${currentXp}/${nextLevelXp} XP`}
              />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex flex-col justify-between rounded-3xl bg-gradient-to-br from-[#005581]/15 via-[#1D9E75]/10 to-white p-6 shadow-soft dark:from-[#005581]/25 dark:to-[#0a1f2e]"
      >
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#6b7280]">
              Today&apos;s Quest
            </span>
            <span className="rounded-full bg-[#1D9E75]/15 px-2 py-0.5 text-xs font-semibold text-[#1D9E75]">
              +200 XP
            </span>
          </div>
          <h3 className="text-lg font-bold text-heading">{questTitle}</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Finish your practice set to unlock the weekly bonus multiplier.
          </p>
        </div>
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-semibold text-[#6b7280]">
            <span>Progress</span>
            <span>
              {questProgress}/{questTotal}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-[#1D9E75]"
              initial={{ width: 0 }}
              animate={{
                width: `${(questProgress / questTotal) * 100}%`,
              }}
              transition={{ duration: 0.6 }}
            />
          </div>
        </div>
      </motion.div>
    </motion.section>
  );
}
