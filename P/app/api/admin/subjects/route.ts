import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// ── helpers ────────────────────────────────────────────────────────────────
async function requireAdmin(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return profile?.role === "admin" ? user.id : null;
}

function unauthorised() {
  return NextResponse.json({ error: "Unauthorised" }, { status: 403 });
}

// ── GET /api/admin/subjects ── list all ────────────────────────────────────
export async function GET() {
  const userId = await requireAdmin();
  if (!userId) return unauthorised();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .select("id, name, code, year, semester")
    .order("year")
    .order("semester");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subjects: data });
}

// ── POST /api/admin/subjects ── create ─────────────────────────────────────
export async function POST(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) return unauthorised();

  const body = await request.json();
  const { name, year, semester, code } = body as {
    name: string;
    year: number;
    semester: number;
    code?: string;
  };

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .insert({
      name: name.trim(),
      year: Number(year),
      semester: Number(semester),
      code:
        code?.trim() ||
        `NEW-${year}S${semester}-${name.slice(0, 4).toUpperCase().replace(/\s/g, "")}`,
    })
    .select("id, name, code, year, semester")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subject: data }, { status: 201 });
}

// ── PATCH /api/admin/subjects ── update ────────────────────────────────────
export async function PATCH(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) return unauthorised();

  const body = await request.json();
  const { id, name, year, semester, code } = body as {
    id: string;
    name: string;
    year: number;
    semester: number;
    code?: string;
  };

  if (!id || !name?.trim()) {
    return NextResponse.json({ error: "id and name are required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("subjects")
    .update({
      name: name.trim(),
      year: Number(year),
      semester: Number(semester),
      code: code?.trim() || null,
    })
    .eq("id", id)
    .select("id, name, code, year, semester")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ subject: data });
}

// ── DELETE /api/admin/subjects ── delete ───────────────────────────────────
export async function DELETE(request: NextRequest) {
  const userId = await requireAdmin();
  if (!userId) return unauthorised();

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "id is required" }, { status: 400 });
  }

  const supabase = await createClient();
  const { error } = await supabase.from("subjects").delete().eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
