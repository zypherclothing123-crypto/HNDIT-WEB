import { StudentShell } from "@/components/layout/StudentShell";

export default function QuizDemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentShell>{children}</StudentShell>;
}
