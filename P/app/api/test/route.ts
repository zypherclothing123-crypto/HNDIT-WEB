
import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function GET() {
  console.log("== /api/test START ==");
  try {
    const text = await generateText("Hello, this is a test!");
    return NextResponse.json({ success: true, text });
  } catch (error) {
    console.error("ERROR in /api/test:", error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
