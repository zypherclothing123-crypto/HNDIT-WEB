"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";

type ProfileRow = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: string | null;
  avatar_url: string | null;
};

export function UserTable() {
  const supabase = createClient();
  const [rows, setRows] = useState<ProfileRow[]>([]);

  async function load() {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, role, avatar_url")
      .order("created_at", { ascending: false });
    setRows(data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function toggleAdmin(id: string, toAdmin: boolean) {
    await supabase
      .from("profiles")
      .update({ role: toAdmin ? "admin" : "user" })
      .eq("id", id);
    await load();
  }

  return (
    <div className="overflow-hidden rounded-2xl border bg-white shadow-soft dark:bg-[#0a1f2e]">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
          <tr>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Admin</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const label = r.full_name?.trim() || r.email || "—";
            const initials = (r.full_name?.trim() || r.email || "?")
              .slice(0, 2)
              .toUpperCase();
            const avatarSrc = profileAvatarPublicUrl(supabase, r.avatar_url);
            return (
              <tr key={r.id} className="border-t">
              <td className="px-4 py-3 font-medium">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    {avatarSrc ? (
                      <AvatarImage
                        src={avatarSrc}
                        alt=""
                        className="object-cover"
                      />
                    ) : null}
                    <AvatarFallback className="text-[10px] font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <span className="min-w-0 truncate">{label}</span>
                </div>
              </td>
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3">
                <Switch
                  checked={r.role === "admin"}
                  onCheckedChange={(v) => void toggleAdmin(r.id, v)}
                />
              </td>
            </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
