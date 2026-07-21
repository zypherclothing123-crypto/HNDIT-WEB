import { StudentShell } from "@/components/layout/StudentShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
