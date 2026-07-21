import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { LabCard } from "@/components/labs/LabCard";

export default async function SubjectLabsPage({
  params,
}: {
  params: { subjectId: string };
}) {
  const supabase = await createClient();
  const { data: subject } = await supabase
    .from("subjects")
    .select("*")
    .eq("id", params.subjectId)
    .single();

  if (!subject) notFound();

  const { data: labs } = await supabase
    .from("labs")
    .select("id, title, description, difficulty, order_index")
    .eq("subject_id", params.subjectId)
    .order("order_index", { ascending: true });

  const { data: { user } } = await supabase.auth.getUser();

  const completedLabIds = new Set<string>();
  if (user && (labs ?? []).length > 0) {
    const labIds = (labs ?? []).map((l) => l.id as string);
    const { data: progress } = await supabase
      .from("user_progress")
      .select("lab_id, completed")
      .eq("user_id", user.id)
      .in("lab_id", labIds);
    for (const row of progress ?? []) {
      if (row.completed) completedLabIds.add(row.lab_id as string);
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <p className="text-sm font-semibold text-[#534AB7]">
          Year {subject.year} • Sem {subject.semester}
        </p>
        <h1 className="text-3xl font-bold text-heading">{subject.name}</h1>
        {subject.description ? (
          <p className="mt-2 max-w-2xl text-muted-foreground">
            {subject.description}
          </p>
        ) : null}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {(labs ?? []).map((lab) => (
          <Link key={lab.id} href={`/labs/${params.subjectId}/${lab.id}`}>
            <LabCard
              lab={lab}
              completed={completedLabIds.has(lab.id as string)}
            />
          </Link>
        ))}
      </div>
      {!labs?.length ? (
        <p className="text-sm text-muted-foreground">
          No labs yet for this subject. Admins can upload PDFs to generate them.
        </p>
      ) : null}
    </div>
  );
}
