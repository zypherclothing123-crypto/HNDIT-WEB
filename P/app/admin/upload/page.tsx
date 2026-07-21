import { ContentUploadZone } from "@/components/admin/ContentUploadZone";
import { createClient } from "@/lib/supabase/server";

export default async function AdminUploadPage() {
  const supabase = await createClient();
  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, year, semester")
    .order("year")
    .order("semester");

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold text-heading">Upload Center</h1>
      <ContentUploadZone subjects={subjects ?? []} />
    </div>
  );
}
