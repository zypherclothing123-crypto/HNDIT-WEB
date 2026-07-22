"use client";

import Link from "next/link";
import {
  ExternalLink,
  GraduationCap,
  Shield,
  SlidersHorizontal,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Props = {
  siteName: string;
  publicSupabaseUrl: string;
};

export function AdminSettingsView({
  siteName,
  publicSupabaseUrl,
}: Props) {
  const supabaseHost = (() => {
    try {
      return publicSupabaseUrl
        ? new URL(publicSupabaseUrl).host
        : "Not configured";
    } catch {
      return publicSupabaseUrl || "Not configured";
    }
  })();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-wide text-[#005581]">
          Settings
        </p>
        <h1 className="mt-1 text-2xl font-bold text-heading">Platform</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reference links and environment hints for operators. Sensitive keys
          stay in server env and are never shown here.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-[#005581]" />
              <CardTitle className="text-lg">Student experience</CardTitle>
            </div>
            <CardDescription>
              Branding label and shortcuts to the learner app.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Product name
              </p>
              <p className="text-base font-semibold text-heading">{siteName}</p>
            </div>
            <hr className="border-muted" />
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/dashboard" target="_blank" rel="noopener noreferrer">
                  Open student dashboard
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
              <Button variant="outline" className="rounded-xl" asChild>
                <Link href="/labs" target="_blank" rel="noopener noreferrer">
                  Curriculum (labs)
                  <ExternalLink className="ml-2 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-[#005581]" />
              <CardTitle className="text-lg">Supabase</CardTitle>
            </div>
            <CardDescription>
              Public API URL (safe to expose to browsers). Manage RLS, auth, and
              storage in the Supabase dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Project host
              </p>
              <p className="break-all font-mono text-sm text-heading">
                {supabaseHost}
              </p>
            </div>
            <hr className="border-muted" />
            <Button variant="outline" className="rounded-xl" asChild>
              <a
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noopener noreferrer"
              >
                Supabase dashboard
                <ExternalLink className="ml-2 h-3.5 w-3.5" />
              </a>
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-soft lg:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="h-5 w-5 text-[#005581]" />
              <CardTitle className="text-lg">Operations</CardTitle>
            </div>
            <CardDescription>
              Administration tasks supported in this build.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Use <strong className="text-heading">Students</strong> to toggle
              admin access, <strong className="text-heading">Subjects</strong>{" "}
              and <strong className="text-heading">Labs</strong> for curriculum,
              and <strong className="text-heading">Content Upload</strong> for
              materials. Feature flags and email templates are not stored in
              this app yet—configure auth and storage policies in Supabase.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <Button variant="secondary" className="rounded-xl" asChild>
                <Link href="/admin/users">Manage users</Link>
              </Button>
              <Button variant="secondary" className="rounded-xl" asChild>
                <Link href="/admin/upload">Upload content</Link>
              </Button>
              <Button variant="secondary" className="rounded-xl" asChild>
                <Link href="/admin/analytics">View analytics</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
