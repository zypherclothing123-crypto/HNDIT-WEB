import { createClient } from "@/lib/supabase/server";
import { fetchAdminAnalytics } from "@/lib/admin-analytics";
import { AdminAnalyticsView } from "@/components/admin/AdminAnalyticsView";

export default async function AdminAnalyticsPage() {
  const supabase = await createClient();
  const data = await fetchAdminAnalytics(supabase);
  return <AdminAnalyticsView data={data} />;
}
