import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { QuizEngine } from "@/components/quiz/QuizEngine";
import type { Question } from "@/components/labs/QuizPlayer";
import {
  fetchLeaderboardEntries,
  rankForUser,
} from "@/lib/leaderboard-stats";

export const dynamic = "force-dynamic";

function normalizeOptions(raw: unknown): string[] | null {
  if (raw == null) return null;
  if (!Array.isArray(raw)) return null;
  return raw.map((x) => (typeof x === "string" ? x : String(x)));
}

function normalizeRow(row: {
  id: string;
  question_text: string;
  options: unknown;
  correct_answer: string | null;
  explanation?: string | null;
  question_type?: string | null;
  points?: number | null;
}): Question {
  return {
    id: row.id,
    question_text: row.question_text,
    options: normalizeOptions(row.options),
    correct_answer: row.correct_answer,
    explanation: row.explanation ?? null,
    question_type: row.question_type ?? null,
    points: row.points ?? null,
  };
}

type SubjectEmbed = { name: string } | { name: string }[] | null;

function pickSubjectName(embed: SubjectEmbed, fallback: string): string {
  if (embed == null) return fallback;
  if (Array.isArray(embed)) return embed[0]?.name ?? fallback;
  return embed.name ?? fallback;
}

export default async function QuizDemoPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const supabase = await createClient();
  const labParam = searchParams.labId;
  const subjectParam = searchParams.subjectId;
  const labId =
    typeof labParam === "string" && labParam.length > 0 ? labParam : null;
  const subjectId =
    typeof subjectParam === "string" && subjectParam.length > 0
      ? subjectParam
      : null;

  const { data: { user } } = await supabase.auth.getUser();

  let topicLabel = "Quiz";
  let subtitle: string | null = null;
  let rows: Question[] = [];
  let resolvedLabId: string | null = labId;
  let globalRank: number | null = null;
  let leaderboardPeers: {
    displayName: string;
    avatarUrl: string | null;
  }[] = [];

  if (user) {
    const entries = await fetchLeaderboardEntries(supabase);
    globalRank = rankForUser(entries, user!.id);
    leaderboardPeers = entries
      .filter((e) => e.userId !== user!.id)
      .slice(0, 3)
      .map((e) => ({
        displayName: e.displayName,
        avatarUrl: e.avatarUrl,
      }));
  }

  if (labId) {
    const { data: lab } = await supabase
      .from("labs")
      .select("title, subjects(name)")
      .eq("id", labId)
      .maybeSingle();

    const { data: qs } = await supabase
      .from("questions")
      .select(
        "id, question_text, options, correct_answer, explanation, question_type, points"
      )
      .eq("lab_id", labId)
      .order("created_at", { ascending: true });

    rows = (qs ?? []).map(normalizeRow);
    topicLabel = pickSubjectName(
      (lab?.subjects ?? null) as SubjectEmbed,
      lab?.title ?? "Lab"
    );
    subtitle = lab?.title ?? null;
  } else if (subjectId) {
    const { data: sub } = await supabase
      .from("subjects")
      .select("name")
      .eq("id", subjectId)
      .maybeSingle();

    const { data: qs } = await supabase
      .from("questions")
      .select(
        "id, question_text, options, correct_answer, explanation, question_type, points"
      )
      .eq("subject_id", subjectId)
      .order("created_at", { ascending: true });

    rows = (qs ?? []).map(normalizeRow);
    topicLabel = sub?.name ?? "Subject";
    subtitle = null;
  } else {
    const { data: anyRow } = await supabase
      .from("questions")
      .select("lab_id")
      .not("lab_id", "is", null)
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    const fallbackLabId = anyRow?.lab_id as string | undefined;
    resolvedLabId = fallbackLabId ?? null;
    if (fallbackLabId) {
      const { data: lab } = await supabase
        .from("labs")
        .select("title, subjects(name)")
        .eq("id", fallbackLabId)
        .maybeSingle();

      const { data: qs } = await supabase
        .from("questions")
        .select(
          "id, question_text, options, correct_answer, explanation, question_type, points"
        )
        .eq("lab_id", fallbackLabId)
        .order("created_at", { ascending: true });

      rows = (qs ?? []).map(normalizeRow);
      topicLabel = pickSubjectName(
        (lab?.subjects ?? null) as SubjectEmbed,
        lab?.title ?? "Lab"
      );
      subtitle = lab?.title ?? null;
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      {!user ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100">
          <p className="font-semibold">Sign in to load quiz questions</p>
          <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
            Questions use Row Level Security (
            <code className="rounded bg-amber-100/80 px-1 dark:bg-amber-900/60">
              authenticated
            </code>
            ).{" "}
            <Link href="/" className="font-semibold underline">
              Log in
            </Link>{" "}
            — then return here or open a lab quiz.
          </p>
        </div>
      ) : null}
      <p className="text-xs text-muted-foreground">
        Optional query:{" "}
        <code className="rounded bg-muted px-1">?labId=…</code> or{" "}
        <code className="rounded bg-muted px-1">?subjectId=…</code>
        {user && rows.length === 0
          ? " — no rows returned (check lab has questions)."
          : null}
      </p>
      <QuizEngine
        questions={rows}
        topicLabel={topicLabel}
        subtitle={subtitle}
        labId={resolvedLabId}
        globalRank={user ? globalRank : null}
        leaderboardPeers={user ? leaderboardPeers : []}
      />
    </div>
  );
}
