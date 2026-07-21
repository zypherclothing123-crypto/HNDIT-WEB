import { UserTable } from "@/components/admin/UserTable";

export default function AdminUsersPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-4">
      <h1 className="text-2xl font-bold text-heading">Users</h1>
      <UserTable />
    </div>
  );
}
