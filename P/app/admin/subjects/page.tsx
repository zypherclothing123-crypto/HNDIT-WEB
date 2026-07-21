import { createClient } from "@/lib/supabase/server";
import { buildSubjectStats } from "@/lib/subject-stats";
import { AdminSubjectsWorkspace } from "@/components/admin/AdminSubjectsWorkspace";

export default async function AdminSubjectsPage() {
  const supabase = await createClient();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, year, semester, code")
    .order("year")
    .order("semester");

  const stats = await buildSubjectStats(supabase, subjects ?? []);

  return (
    <div className="mx-auto max-w-6xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-heading">Subjects</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create subjects below, then click a card to update its details or delete
          it. Labs links open the student view for a quick preview.
        </p>
      </header>
      <AdminSubjectsWorkspace initialStats={stats} />
    </div>
  );
}
