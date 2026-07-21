import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { LabViewer } from "@/components/labs/LabViewer";
import type { Question } from "@/components/labs/QuizPlayer";

export default async function LabDetailPage({
  params,
}: {
  params: { subjectId: string; labId: string };
}) {
  const supabase = await createClient();
  const { data: lab } = await supabase
    .from("labs")
    .select("*")
    .eq("id", params.labId)
    .eq("subject_id", params.subjectId)
    .single();

  if (!lab) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("lab_id", params.labId)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl">
      <LabViewer lab={lab} questions={(questions ?? []) as Question[]} />
    </div>
  );
}
