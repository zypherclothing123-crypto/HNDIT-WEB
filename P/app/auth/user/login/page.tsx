"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";

export default function UserLoginPage() {
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

    const { data, error: signErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signErr) {
      setLoading(false);
      setError(signErr.message);
      return;
    }
    const uid = data.user?.id;
    if (!uid) {
      setLoading(false);
      setError("No user returned");
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return (
    <div className="page-shell flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md rounded-3xl border bg-card p-8 shadow-soft">
        <h1 className="text-2xl font-bold text-heading">Welcome back, Student</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in as a student to continue to HNDIT Smart Lab.
        </p>
        {error ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-200">
            {error}
          </p>
        ) : null}
        <div className="mt-8">
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <div className="flex items-center justify-between gap-2">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-semibold text-[#534AB7] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <PasswordInput
                id="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>
            {error ? <p className="text-sm text-red-600">{error}</p> : null}
            <Button
              type="submit"
              variant="default"
              size="default"
              className="w-full rounded-xl"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in as Student"}
            </Button>
          </form>
        </div>
        <div className="mt-6 flex flex-col gap-2 text-center">
          <p className="text-sm text-muted-foreground">
            No student account?{" "}
            <Link href="/auth/user/register" className="font-semibold text-[#534AB7]">
              Register as Student
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            Are you an admin?{" "}
            <Link href="/auth/admin/login" className="font-semibold text-[#534AB7]">
              Sign in as Admin
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
