import { AdminSettingsView } from "@/components/admin/AdminSettingsView";

const SITE_NAME = "HNDIT Smart Lab";

export default function AdminSettingsPage() {
  const publicSupabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ?? "";

  return (
    <AdminSettingsView
      siteName={SITE_NAME}
      publicSupabaseUrl={publicSupabaseUrl}
    />
  );
}
