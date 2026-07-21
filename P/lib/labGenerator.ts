import { generateText } from "@/lib/gemini";

export type GeneratedLabPayload = {
  title: string;
  description: string;
  theory_content: { sections: { heading: string; body: string }[] };
  practical_steps: { step: number; title: string; detail: string }[];
  code_examples: {
    language: string;
    code: string;
    explanation?: string;
  }[];
  simulation_data: Record<string, unknown>;
  difficulty: string;
  questions: {
    question_text: string;
    options: string[];
    correct_answer: string;
    explanation?: string;
    question_type: "mcq";
    points: number;
  }[];
};

const SYSTEM_INSTRUCTION = `You are an HNDIT curriculum assistant. Output ONLY valid minified JSON matching this TypeScript type (no markdown fences):
{
  "title": string,
  "description": string,
  "theory_content": { "sections": { "heading": string, "body": string }[] },
  "practical_steps": { "step": number, "title": string, "detail": string }[],
  "code_examples": { "language": string, "code": string, "explanation"?: string }[],
  "simulation_data": object,
  "difficulty": "beginner" | "intermediate" | "advanced",
  "questions": {
    "question_text": string,
    "options": string[],
    "correct_answer": string,
    "explanation"?: string,
    "question_type": "mcq",
    "points": number
  }[]
}
IMPORTANT: Generate ONLY Multiple Choice Questions (mcq) in the questions array. Do not generate short-answer, theory, or code questions. Include at least 4 MCQs with 4 options each. Keep simulation_data as a small placeholder object if not applicable.`;

export async function generateLabFromNotes(
  noteExcerpt: string,
  subjectName: string
): Promise<GeneratedLabPayload> {
  const excerpt =
    noteExcerpt.length > 12000
      ? noteExcerpt.slice(0, 12000) + "\n...[truncated]"
      : noteExcerpt;

  const raw = await generateText(
    `${SYSTEM_INSTRUCTION}\n\nSubject: ${subjectName}\n\nCourse notes:\n${excerpt}`
  );

  let jsonStr = raw.trim();
  
  // Robust cleaning of Gemini output
  if (jsonStr.includes("{")) {
    const start = jsonStr.indexOf("{");
    const end = jsonStr.lastIndexOf("}");
    if (end > start) {
      jsonStr = jsonStr.slice(start, end + 1);
    }
  }

  // Remove potential trailing commas before closing braces/brackets
  jsonStr = jsonStr.replace(/,\s*([\]}])/g, "$1");

  try {
    const parsed = JSON.parse(jsonStr) as GeneratedLabPayload;
    return parsed;
  } catch (e) {
    console.error("Failed to parse Gemini JSON:", jsonStr);
    throw new Error("AI generated an invalid data format. Please try again.");
  }
}
