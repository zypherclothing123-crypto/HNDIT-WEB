"use client";

import {
  BarChart3,
  BookOpen,
  Code,
  Database,
  Flame,
  Medal,
  Network,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

/** Serializable icon keys for props crossing the Server → Client boundary. */
export const DASHBOARD_ICONS = {
  medal: Medal,
  bookOpen: BookOpen,
  trophy: Trophy,
  barChart3: BarChart3,
  code: Code,
  database: Database,
  network: Network,
  flame: Flame,
  zap: Zap,
} as const;

export type DashboardIconName = keyof typeof DASHBOARD_ICONS;

export function resolveDashboardIcon(
  name: DashboardIconName
): LucideIcon {
  return DASHBOARD_ICONS[name];
}
