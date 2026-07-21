import type { SupabaseClient } from "@supabase/supabase-js";
import type { SubjectCardAdmin } from "@/components/admin/SubjectManagementGrid";

export type SubjectRowInput = {
  id: string;
  name: string;
  year: number;
  semester: number;
  code?: string | null;
};

/**
 * Per-subject aggregates for admin UI (labs, learners, questions, uploads).
 */
export async function buildSubjectStats(
  supabase: SupabaseClient,
  subjectList: SubjectRowInput[],
  options?: { limit?: number }
): Promise<SubjectCardAdmin[]> {
  const list =
    options?.limit != null
      ? subjectList.slice(0, options.limit)
      : subjectList;

  const subjectIds = list.map((s) => s.id);
  if (!subjectIds.length) return [];

  const { data: labs } = await supabase
    .from("labs")
    .select("id, subject_id")
    .in("subject_id", subjectIds);

  const labIdsBySubject = new Map<string, string[]>();
  for (const l of labs ?? []) {
    const sid = l.subject_id as string;
    const arr = labIdsBySubject.get(sid) ?? [];
    arr.push(l.id as string);
    labIdsBySubject.set(sid, arr);
  }

  const labToSubject = new Map<string, string>();
  for (const l of labs ?? []) {
    labToSubject.set(l.id as string, l.subject_id as string);
  }

  const learnersBySubject = new Map<string, Set<string>>();
  const allLabIds = (labs ?? []).map((l) => l.id as string);
  if (allLabIds.length) {
    const { data: progress } = await supabase
      .from("user_progress")
      .select("user_id, lab_id")
      .in("lab_id", allLabIds);

    for (const row of progress ?? []) {
      const labId = row.lab_id as string | null;
      const uid = row.user_id as string | null;
      if (!labId || !uid) continue;
      const sid = labToSubject.get(labId);
      if (!sid) continue;
      if (!learnersBySubject.has(sid)) learnersBySubject.set(sid, new Set());
      learnersBySubject.get(sid)!.add(uid);
    }
  }

  const { data: questions } = await supabase
    .from("questions")
    .select("subject_id")
    .in("subject_id", subjectIds);

  const questionCountBySubject = new Map<string, number>();
  for (const q of questions ?? []) {
    const sid = q.subject_id as string;
    questionCountBySubject.set(sid, (questionCountBySubject.get(sid) ?? 0) + 1);
  }

  const { data: notes } = await supabase
    .from("uploaded_notes")
    .select("subject_id")
    .in("subject_id", subjectIds);

  const materialsBySubject = new Map<string, number>();
  for (const n of notes ?? []) {
    const sid = n.subject_id as string | null;
    if (!sid) continue;
    materialsBySubject.set(sid, (materialsBySubject.get(sid) ?? 0) + 1);
  }

  return list.map((s) => ({
    id: s.id,
    name: s.name,
    year: s.year,
    semester: s.semester,
    code: s.code ?? null,
    labCount: labIdsBySubject.get(s.id)?.length ?? 0,
    learnerCount: learnersBySubject.get(s.id)?.size ?? 0,
    questionCount: questionCountBySubject.get(s.id) ?? 0,
    materialCount: materialsBySubject.get(s.id) ?? 0,
  }));
}
