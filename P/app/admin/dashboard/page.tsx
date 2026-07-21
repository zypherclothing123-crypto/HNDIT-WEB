import { createClient } from "@/lib/supabase/server";
import { buildSubjectStats } from "@/lib/subject-stats";
import { AdminDashboardShell } from "@/components/admin/AdminDashboardShell";
import type { UploadRow } from "@/components/admin/RecentUploadsTable";
import { fetchWeeklyEngagement } from "@/lib/engagement-stats";
import { fetchStudentSignupGrowth } from "@/lib/student-stats";

export default async function AdminDashboardPage() {
  const supabase = await createClient();

  // Optimized: Group unique queries and derive counts from results to prevent stack pressure
  const [
    studentRes,
    subjectRes,
    aiRes,
    quizRes,
    notesRes,
    engagement,
    studentGrowthHint
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("subjects").select("id, name, year, semester, code").order("year").order("semester"),
    supabase.from("uploaded_notes").select("*", { count: "exact", head: true }).eq("ai_analyzed", true),
    supabase.from("user_progress").select("*", { count: "exact", head: true }).eq("completed", true),
    supabase.from("uploaded_notes").select("id, file_name, file_url, ai_analyzed, created_at, subject_id").order("created_at", { ascending: false }).limit(12),
    fetchWeeklyEngagement(supabase),
    fetchStudentSignupGrowth(supabase),
  ]);

  const studentCount = studentRes.count ?? 0;
  const rawSubjects = subjectRes.data ?? [];
  
  // Sanitize subjects: Ensure plain objects with no hidden state or circular refs
  const subjects = rawSubjects.map(s => ({
    id: s.id,
    name: s.name,
    year: s.year,
    semester: s.semester,
    code: s.code ?? null
  }));

  const aiCount = aiRes.count ?? 0;
  const quizCount = quizRes.count ?? 0;
  const rawNotes = notesRes.data ?? [];

  // Map for internal server-side use is fine, but don't pass it to the client
  const nameByIdServer = new Map(
    subjects.map((s) => [s.id, s.name] as const)
  );

  const rawStats = await buildSubjectStats(supabase, subjects, {
    limit: 8,
  });

  // Sanitize subject stats
  const subjectStats = rawStats.map(s => ({
    id: s.id,
    name: s.name,
    year: s.year,
    semester: s.semester,
    code: s.code ?? null,
    labCount: s.labCount,
    learnerCount: s.learnerCount,
    questionCount: s.questionCount,
    materialCount: s.materialCount
  }));

  const uploads: UploadRow[] =
    rawNotes.map((n) => ({
      id: n.id,
      file_name: n.file_name,
      file_url: n.file_url,
      subject_id: n.subject_id,
      ai_analyzed: n.ai_analyzed,
      created_at: n.created_at,
      subject: n.subject_id
        ? { name: nameByIdServer.get(n.subject_id) ?? "—" }
        : null,
    }));

  return (
    <AdminDashboardShell
      stats={{
        totalStudents: studentCount,
        activeSubjects: subjects.length,
        aiAnalyses: aiCount,
        quizCompletions: quizCount,
        studentGrowthHint: studentGrowthHint ?? undefined,
      }}
      subjects={subjects}
      subjectStats={subjectStats}
      uploads={uploads}
      engagement={{
        chart: engagement.chart.map(c => ({ day: c.day, activity: c.activity })),
        peakDayLabel: engagement.peakDayLabel,
        peakCount: engagement.peakCount,
        weekTotal: engagement.weekTotal,
        prevWeekTotal: engagement.prevWeekTotal,
        weekOverWeekPct: engagement.weekOverWeekPct
      }}
    />
  );
}
