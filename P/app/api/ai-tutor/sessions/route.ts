import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/api-auth";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("chat_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ sessions: data ?? [] });
}

export async function POST(req: Request) {
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => ({}));
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: user.id,
      session_title: body.session_title ?? "New Chat",
      mode: body.mode ?? "general",
      language: body.language ?? "en",
      messages: body.messages ?? [],
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ session: data });
}

export async function PUT(req: Request) {
  const { supabase, user } = await getRouteUser(req);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const id = Number(body.id);
  if (!id) {
    return NextResponse.json({ error: "id required" }, { status: 400 });
  }

  const { error } = await supabase
    .from("chat_sessions")
    .update({
      messages: body.messages,
      session_title: body.session_title,
      mode: body.mode,
      language: body.language,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
