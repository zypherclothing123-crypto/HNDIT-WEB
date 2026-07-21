import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminLabsWorkspace } from "@/components/admin/AdminLabsWorkspace";

export default async function AdminLabsPage() {
  const supabase = await createClient();
  const { data: labs } = await supabase
    .from("labs")
    .select("id, title, subject_id")
    .order("created_at", { ascending: false })
    .limit(100);

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name")
    .order("year")
    .order("semester");

  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <header>
        <h1 className="text-2xl font-bold text-heading">Labs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit titles and move labs between subjects. Renaming a subject’s display
          name (not its ID) is done under{" "}
          <Link href="/admin/subjects" className="font-semibold text-[#534AB7] underline">
            Subjects
          </Link>
          .
        </p>
      </header>
      <AdminLabsWorkspace labs={labs ?? []} subjects={subjects ?? []} />
    </div>
  );
}
