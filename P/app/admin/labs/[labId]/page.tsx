import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminQuestionsWorkspace } from "@/components/admin/AdminQuestionsWorkspace";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AdminLabQuestionsPage({
  params,
}: {
  params: { labId: string };
}) {
  const supabase = await createClient();

  const { data: lab } = await supabase
    .from("labs")
    .select("id, title, subject_id")
    .eq("id", params.labId)
    .single();

  if (!lab) notFound();

  const { data: questions } = await supabase
    .from("questions")
    .select("*")
    .eq("lab_id", params.labId)
    .order("created_at", { ascending: true });

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header className="space-y-2">
        <Link
          href="/admin/labs"
          className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-heading"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Labs
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-heading">
            Manage Questions: {lab.title}
          </h1>
          <p className="text-sm text-muted-foreground">
            Add and edit multiple-choice questions for this lab.
          </p>
        </div>
      </header>

      <AdminQuestionsWorkspace
        labId={lab.id}
        subjectId={lab.subject_id}
        initialQuestions={questions ?? []}
      />
    </div>
  );
}
