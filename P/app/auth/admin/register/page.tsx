"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";

export default function AdminRegisterPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent("/admin/dashboard")}`;

    const { error: signErr } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "admin" },
        emailRedirectTo,
      },
    });
    setLoading(false);
    if (signErr) {
      setError(signErr.message);
      return;
    }
    router.push("/admin/dashboard");
    router.refresh();
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-heading">Create Admin Account</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Join HNDIT Smart Lab as an administrator.
        </p>
        <div className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full name</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button type="submit" className="w-full rounded-xl" disabled={loading}>
              {loading ? "Creating admin account..." : "Create Admin Account"}
            </Button>
          </form>
        </div>
        <div className="mt-6 flex flex-col gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an admin account?{" "}
            <Link href="/auth/admin/login" className="font-semibold text-[#534AB7]">
              Sign in as Admin
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Are you a student?{" "}
            <Link href="/auth/user/login" className="font-semibold text-[#534AB7]">
              Sign in as Student
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
