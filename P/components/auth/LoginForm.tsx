"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/PasswordInput";
import { Label } from "@/components/ui/label";

export function LoginForm() {
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
    // Detect which submit button was used (user or admin)
    const submitter = (e.nativeEvent as any)?.submitter as HTMLElement | undefined;
    const overrideRole = submitter?.dataset?.role as string | undefined;

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
    if (overrideRole === "admin") {
      router.replace("/admin/dashboard");
      router.refresh();
      return;
    }

    if (overrideRole === "user") {
      router.replace("/dashboard");
      router.refresh();
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", uid)
      .single();
    const dest = profile?.role === "admin" ? "/admin/dashboard" : "/dashboard";
    router.replace(dest);
    router.refresh();
  }

  return (
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
      <div className="flex gap-3">
        <Button
          type="submit"
          data-role="user"
          variant="default"
          size="default"
          className="flex-1 rounded-xl"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in (User)"}
        </Button>
        <Button
          type="submit"
          data-role="admin"
          variant="default"
          size="default"
          className="flex-1 rounded-xl"
          disabled={loading}
        >
          {loading ? "Signing in..." : "Sign in (Admin)"}
        </Button>
      </div>
    </form>
  );
}
