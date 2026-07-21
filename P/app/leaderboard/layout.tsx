import { StudentShell } from "@/components/layout/StudentShell";

export default function LeaderboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
