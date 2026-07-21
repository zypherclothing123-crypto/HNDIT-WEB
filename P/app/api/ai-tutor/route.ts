import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";
import { getRouteUser } from "@/lib/supabase/api-auth";
type TutorMode =
  | "general"
  | "concept_explain"
  | "code_debug"
  | "past_papers"
  | "lab_practical";

function systemPrompt(mode: TutorMode, language: string) {
  const isSi = language === "si";
  const lang = isSi
    ? "Respond PRIMARILY in Sinhala (සිංහල). Use clear Sinhala Unicode. Use English technical terms (e.g., 'Router', 'Operating System', 'Pointer') within Sinhala sentences for clarity. If the student asks in English, you may use a mix."
    : "Respond in clear English suitable for HNDIT undergraduates.";

  const base = `${lang}\nYou are "HNDIT AI Study Assistant". Be concise, accurate, and aligned with the Sri Lankan HNDIT curriculum.`;

  if (isSi) {
    switch (mode) {
      case "concept_explain":
        return `${base}\nසංකල්ප පියවරෙන් පියවර පැහැදිලි කරන්න. උදාහරණ සහ විභාගයේදී සිදුවිය හැකි වැරදි පෙන්වා දෙන්න.`;
      case "code_debug":
        return `${base}\nකේතයේ ඇති දෝෂ හඳුනාගෙන ඒවා නිවැරදි කිරීමට උදවු වන්න. දෝෂය ඇතිවීමට හේතුව සහ විසඳුම පැහැදිලි කරන්න.`;
      case "past_papers":
        return `${base}\nපසුගිය විභාග ප්‍රශ්න වලට පිළිතුරු සැපයීමේ රටාව, ලකුණු ලැබෙන ආකාරය සහ කාල කළමනාකරණය ගැන අවධානය යොමු කරන්න.`;
      case "lab_practical":
        return `${base}\nප්‍රායෝගික පරීක්ෂණ සඳහා මඟ පෙන්වීම ලබා දෙන්න: IDE භාවිතය, පියවර, බලාපොරොත්තු වන ප්‍රතිදානය (Output) සහ ගැටළු විසඳීම.`;
      default:
        return `${base}\nසාමාන්‍ය අධ්‍යයන කටයුතු සඳහා සහාය වන්න.`;
    }
  }

  switch (mode) {
    case "concept_explain":
      return `${base}\nExplain concepts step-by-step with examples and common exam pitfalls.`;
    case "code_debug":
      return `${base}\nHelp debug code: identify the bug, propose a fix, and explain why it works.`;
    case "past_papers":
      return `${base}\nFocus on exam-style reasoning: structure answers, marking-style points, and time management tips.`;
    case "lab_practical":
      return `${base}\nGive practical lab guidance: apparatus/IDE steps, safety, expected output, and troubleshooting.`;
    default:
      return `${base}\nGeneral Q&A and study coaching.`;
  }
}

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    const { user } = await getRouteUser(req);

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body = await req.json();
    const messages = body.messages as { role: string; content: string }[];
    const mode = (body.mode ?? "general") as TutorMode;
    const language = (body.language ?? "en") as string;

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }

    const transcriptLines = messages.map(
      (m) => `${m.role === "user" ? "User" : "Assistant"}: ${m.content}`
    );
    const prompt = [
      systemPrompt(mode, language),
      "Conversation:",
      ...transcriptLines,
      "Assistant:",
    ].join("\n");

    const text = await generateText(prompt);

    return NextResponse.json({ reply: text.trim() });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
