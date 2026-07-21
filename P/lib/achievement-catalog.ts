import { TITLES } from "@/lib/achievements";

export type AchievementCatalogEntry = {
  title: (typeof TITLES)[number];
  rarity: "LEGENDARY" | "EPIC" | "RARE" | "COMMON";
  description: string;
  xp: number;
};

/** Earnable badges defined in the product (stored in DB when unlocked). */
export const ACHIEVEMENT_CATALOG: AchievementCatalogEntry[] = [
  {
    title: "First Lab",
    rarity: "COMMON",
    description: "Complete your first Smart Lab quiz.",
    xp: 100,
  },
  {
    title: "Perfect Score",
    rarity: "RARE",
    description: "Score full marks on a lab quiz.",
    xp: 250,
  },
  {
    title: "Speed Learner",
    rarity: "EPIC",
    description: "Finish three lab quizzes in one day.",
    xp: 350,
  },
  {
    title: "Subject Master",
    rarity: "EPIC",
    description: "Complete every lab in one subject.",
    xp: 400,
  },
  {
    title: "HNDIT Star",
    rarity: "LEGENDARY",
    description: "Reach the top 3 on the global leaderboard.",
    xp: 500,
  },
];

export function lockedCatalogEntries(earnedTitles: string[]) {
  const earned = new Set(earnedTitles);
  return ACHIEVEMENT_CATALOG.filter((a) => !earned.has(a.title));
}
