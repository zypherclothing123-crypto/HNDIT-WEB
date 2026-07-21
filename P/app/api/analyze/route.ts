import { NextResponse } from "next/server";
import { getRouteUser } from "@/lib/supabase/api-auth";
import { extractTextFromPdfBuffer } from "@/lib/pdfParser";
import { generateLabFromNotes } from "@/lib/labGenerator";

export const runtime = "nodejs";
export const maxDuration = 120;

/**
 * Admin-only: upload PDF → extract text → Gemini lab JSON → persist labs + questions.
 */
export async function POST(req: Request) {
  try {
    const { supabase, user } = await getRouteUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check admin role via Supabase profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const subjectId = String(form.get("subjectId") ?? "");

    if (!file || !subjectId) {
      return NextResponse.json(
        { error: "file and subjectId required" },
        { status: 400 }
      );
    }

    const buf = Buffer.from(await file.arrayBuffer());
    if (buf.byteLength > 20 * 1024 * 1024) {
      return NextResponse.json({ error: "Max 20MB" }, { status: 400 });
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    const path = `${user.id}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage
      .from("course-materials")
      .upload(path, buf, {
        contentType: file.type || "application/octet-stream",
        upsert: false,
      });

    if (upErr) {
      return NextResponse.json({ error: upErr.message }, { status: 500 });
    }

    const fileUrl = `course-materials/${path}`;

    let extracted = "";
    if (isPdf) {
      try {
        extracted = await extractTextFromPdfBuffer(buf);
      } catch {
        extracted = "";
      }
    }

    const { data: note, error: noteErr } = await supabase
      .from("uploaded_notes")
      .insert({
        subject_id: subjectId,
        uploaded_by: user.id,
        file_name: file.name,
        file_url: fileUrl,
        extracted_text: extracted || null,
        ai_analyzed: false,
      })
      .select()
      .single();

    if (noteErr || !note) {
      return NextResponse.json({ error: noteErr?.message }, { status: 500 });
    }

    if (!extracted) {
      await supabase
        .from("uploaded_notes")
        .update({ ai_analyzed: false })
        .eq("id", note.id);
      return NextResponse.json({
        noteId: note.id,
        message:
          "Uploaded. AI analysis requires PDF text extraction for this file type.",
      });
    }

    const { data: subject } = await supabase
      .from("subjects")
      .select("name")
      .eq("id", subjectId)
      .single();

    const generated = await generateLabFromNotes(
      extracted,
      subject?.name ?? "Subject"
    ).catch(e => {
      console.error("Lab Generation Error:", e);
      throw e;
    });

    const { data: lab, error: labErr } = await supabase
      .from("labs")
      .insert({
        subject_id: subjectId,
        note_id: note.id,
        title: generated.title,
        description: generated.description,
        theory_content: generated.theory_content as unknown as Record<string, unknown>,
        practical_steps: generated.practical_steps as unknown as Record<string, unknown>,
        code_examples: generated.code_examples as unknown as Record<string, unknown>,
        simulation_data: generated.simulation_data,
        difficulty: generated.difficulty,
        order_index: 0,
      })
      .select()
      .single();

    if (labErr || !lab) {
      return NextResponse.json({ error: labErr?.message }, { status: 500 });
    }

    const questionRows = generated.questions.map((q) => ({
      lab_id: lab.id,
      subject_id: subjectId,
      question_text: q.question_text,
      options: q.options,
      correct_answer: q.correct_answer,
      explanation: q.explanation ?? null,
      question_type: q.question_type,
      points: q.points,
    }));

    const { error: qErr } = await supabase.from("questions").insert(questionRows);
    if (qErr) {
      console.error("Question Insertion Error:", qErr);
      return NextResponse.json({ error: qErr.message }, { status: 500 });
    }

    await supabase
      .from("uploaded_notes")
      .update({ ai_analyzed: true })
      .eq("id", note.id);

    return NextResponse.json({ noteId: note.id, labId: lab.id });
  } catch (e) {
    console.error("CRITICAL ANALYSIS ERROR:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
