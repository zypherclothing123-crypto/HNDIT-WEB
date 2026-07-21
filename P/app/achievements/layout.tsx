import { StudentShell } from "@/components/layout/StudentShell";

export default function AchievementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
