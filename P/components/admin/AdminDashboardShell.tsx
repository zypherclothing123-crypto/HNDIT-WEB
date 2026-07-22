"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { StatsOverview } from "@/components/admin/StatsOverview";
import { ContentUploadZone } from "@/components/admin/ContentUploadZone";
import { RecentUploadsTable, type UploadRow } from "@/components/admin/RecentUploadsTable";
import { EngagementChart } from "@/components/admin/EngagementChart";
import type { WeeklyEngagement } from "@/lib/engagement-stats";
import {
  SubjectManagementGrid,
  type SubjectCardAdmin,
} from "@/components/admin/SubjectManagementGrid";

export function AdminDashboardShell({
  stats,
  subjects,
  subjectStats,
  uploads,
  engagement,
}: {
  stats: {
    totalStudents: number;
    activeSubjects: number;
    aiAnalyses: number;
    quizCompletions: number;
    studentGrowthHint?: string;
  };
  subjects: { id: string; name: string; year: number; semester: number }[];
  subjectStats: SubjectCardAdmin[];
  uploads: UploadRow[];
  engagement: WeeklyEngagement;
}) {
  const router = useRouter();

  // Removed aggressive 10s polling as it causes constant compilation in dev mode
  useEffect(() => {
    const interval = setInterval(() => {
      // router.refresh(); 
    }, 60000);
    return () => clearInterval(interval);
  }, [router]);

  return (
    <div className="space-y-8">
      <StatsOverview
        totalStudents={stats.totalStudents}
        activeSubjects={stats.activeSubjects}
        aiAnalyses={stats.aiAnalyses}
        quizCompletions={stats.quizCompletions}
        studentGrowthHint={stats.studentGrowthHint}
      />

      <div className="grid gap-8 xl:grid-cols-[1.2fr_380px]">
        <div className="space-y-6">
          <ContentUploadZone
            subjects={subjects}
            onUploaded={() => router.refresh()}
          />
          <RecentUploadsTable rows={uploads} subjects={subjects} />
        </div>
        <EngagementChart data={engagement} />
      </div>

      <SubjectManagementGrid subjects={subjectStats} />
    </div>
  );
}
