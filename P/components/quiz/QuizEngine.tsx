"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Star, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { saveLabQuizProgress } from "@/lib/quiz-progress";
import type { Question } from "@/components/labs/QuizPlayer";

export function resolveMcqCorrectIndex(q: Question): number {
  const opts = q.options ?? [];
  if (!opts.length) return -1;
  const ans = (q.correct_answer ?? "").trim();
  if (!ans) return -1;
  const byText = opts.findIndex(
    (o) => o.trim().toLowerCase() === ans.toLowerCase()
  );
  if (byText >= 0) return byText;
  const n = parseInt(ans, 10);
  if (!Number.isNaN(n) && n >= 0 && n < opts.length) return n;
  if (/^[A-Za-z]$/.test(ans)) {
    const i = ans.toUpperCase().charCodeAt(0) - 65;
    if (i >= 0 && i < opts.length) return i;
  }
  return -1;
}

function isPlayableMcq(q: Question): boolean {
  const opts = q.options ?? [];
  return opts.length >= 2 && resolveMcqCorrectIndex(q) >= 0;
}

type LeaderboardPeer = {
  displayName: string;
  avatarUrl: string | null;
};

type Props = {
  questions: Question[];
  topicLabel: string;
  subtitle?: string | null;
  labId?: string | null;
  globalRank?: number | null;
  leaderboardPeers?: LeaderboardPeer[];
};

export function QuizEngine({
  questions,
  topicLabel,
  subtitle,
  labId,
  globalRank,
  leaderboardPeers = [],
}: Props) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);
  const user = userId ? { id: userId, email: "" } : null;
  const playable = useMemo(
    () => questions.filter(isPlayableMcq),
    [questions]
  );

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [hintsLeft, setHintsLeft] = useState(3);
  const [eliminated, setEliminated] = useState<Set<number>>(new Set());
  const [seconds, setSeconds] = useState(600);
  const [correctCount, setCorrectCount] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const [streak, setStreak] = useState(0);
  const [xp, setXp] = useState(0);
  const [finished, setFinished] = useState(false);

  const total = playable.length;
  const q = playable[index];
  const correctIdx = q ? resolveMcqCorrectIndex(q) : -1;

  const resetQuestionUi = useCallback(() => {
    setSelected(null);
    setSubmitted(false);
    setEliminated(new Set());
    setHintsLeft(3);
  }, []);

  useEffect(() => {
    resetQuestionUi();
  }, [index, resetQuestionUi]);

  useEffect(() => {
    const t = setInterval(() => {
      setSeconds((s) => Math.max(0, s - 1));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  const statusDots = useMemo(() => {
    return Array.from({ length: total }, (_, i) => {
      if (i < index) return "ok" as const;
      if (i === index) return "current" as const;
      return "upcoming" as const;
    });
  }, [index, total]);

  const accuracyPct =
    attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0;

  const progressPct =
    total > 0
      ? Math.min(
          100,
          Math.round(((index + (submitted ? 1 : 0)) / total) * 100)
        )
      : 0;

  function applyHint() {
    if (!q || hintsLeft <= 0 || submitted || correctIdx < 0) return;
    const opts = q.options ?? [];
    const wrong = opts
      .map((_, i) => i)
      .filter((i) => i !== correctIdx);
    const pick: number[] = [];
    const pool = [...wrong];
    while (pick.length < 2 && pool.length > 0) {
      const r = Math.floor(Math.random() * pool.length);
      pick.push(pool[r]!);
      pool.splice(r, 1);
    }
    setEliminated(
      (prev) => new Set([...Array.from(prev), ...pick])
    );
    setHintsLeft((h) => h - 1);
  }

  const persistRun = useCallback(async () => {
    if (!labId) return;
    
  const user = userId ? { id: userId, email: "" } : null;
    if (!user) return;
    const totalPoints = playable.reduce((a, q) => a + (q.points ?? 10), 0);
    await saveLabQuizProgress(supabase, user.id, labId, xp, totalPoints);
  }, [labId, playable, supabase, xp, user]);

  function goNext() {
    if (index + 1 >= total) {
      setFinished(true);
      void persistRun();
      return;
    }
    setIndex((i) => i + 1);
  }

  function handleSubmit() {
    if (!q || selected === null || correctIdx < 0) return;
    setSubmitted(true);
    const ok = selected === correctIdx;
    setAttempts((a) => a + 1);
    if (ok) {
      setCorrectCount((c) => c + 1);
      setStreak((s) => s + 1);
      setXp((x) => x + (q.points ?? 10));
    } else {
      setStreak(0);
    }
  }

  function handleSkip() {
    if (submitted) return;
    goNext();
  }

  if (total === 0) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center shadow-soft">
        <p className="text-sm font-semibold text-muted-foreground">
          No multiple-choice questions available
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Add questions via a lab (admin upload) or open this page with{" "}
          <code className="rounded bg-muted px-1">?labId=…</code> or{" "}
          <code className="rounded bg-muted px-1">?subjectId=…</code> when you are
          signed in.
        </p>
      </div>
    );
  }

  if (finished) {
    return (
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="rounded-2xl border bg-card p-8 text-center shadow-soft"
      >
        <p className="text-sm font-semibold text-[#534AB7]">Quiz complete</p>
        <h3 className="mt-2 text-2xl font-bold text-heading">
          {attempts > 0
            ? `${correctCount} / ${attempts} correct`
            : "Quiz ended"}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">+{xp} XP this run</p>
        {labId ? (
          <p className="mt-1 text-xs text-muted-foreground">
            Saved to your lab progress in the database.
          </p>
        ) : null}
      </motion.div>
    );
  }

  const options = q.options ?? [];

  return (
    <div className="grid gap-4 text-heading lg:grid-cols-[260px_1fr_260px]">
      <aside className="space-y-4 rounded-2xl border bg-card p-4 shadow-soft">
        <p className="text-xs font-bold uppercase text-[#6b7280]">
          Current Progress
        </p>
        <p className="text-sm font-semibold">
          Question {index + 1}/{total}
        </p>
        <p className="text-xs text-muted-foreground">Topic</p>
        <p className="font-semibold">{topicLabel}</p>
        {subtitle ? (
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="space-y-1">
          <div className="flex justify-between text-xs font-semibold">
            <span>Accuracy</span>
            <span>{attempts ? `${accuracyPct}%` : "—"}</span>
          </div>
          <Progress value={attempts ? accuracyPct : 0} />
        </div>
        <div className="rounded-xl border border-dashed p-3">
          <p className="text-xs font-bold">
            Lifelines: {hintsLeft}/3 left (this question)
          </p>
          <Button
            variant="outline"
            className="mt-2 w-full gap-2 rounded-xl border-dashed"
            type="button"
            onClick={applyHint}
            disabled={hintsLeft === 0 || submitted}
          >
            <Lightbulb className="h-4 w-4" /> Use a Hint
          </Button>
        </div>

        <div className="rounded-xl border bg-white p-3 dark:bg-[#2d2d44]">
          <p className="text-xs font-bold uppercase text-muted-foreground">
            Global rank
          </p>
          <p className="mt-1 text-lg font-bold">
            {globalRank != null ? `#${globalRank}` : "—"}
          </p>
          <p className="text-xs text-muted-foreground">From leaderboard XP</p>
        </div>
      </aside>

      <section className="space-y-4 rounded-2xl border bg-card p-4 shadow-soft">
        <div className="flex items-center justify-between gap-2">
          <Progress value={progressPct} className="h-2 flex-1" />
          <span
            className={`flex items-center gap-1 text-sm font-semibold ${
              seconds < 30 ? "text-red-600" : "text-heading"
            }`}
          >
            <Clock className="h-4 w-4" />
            {mm}:{ss}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-xl font-bold">Practice quiz</h2>
          <span className="rounded-full bg-[#534AB7]/15 px-3 py-0.5 text-xs font-bold text-[#534AB7]">
            From database
          </span>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="rounded-2xl border bg-white p-5 shadow-inner dark:bg-[#2d2d44]"
          >
            <p className="text-lg font-semibold">{q.question_text}</p>
            <div className="mt-4 grid gap-2">
              {options.map((opt, i) => {
                const isSel = selected === i;
                const isElim = eliminated.has(i);
                let cls =
                  "w-full justify-start rounded-xl border-2 border-[#534AB7]/40 bg-white py-3 text-left font-medium dark:bg-[#1a1a2e]";
                if (isSel) {
                  cls =
                    "w-full justify-start rounded-xl border-2 border-[#534AB7] bg-[#534AB7] py-3 text-left font-medium text-white";
                }
                if (submitted && i === correctIdx) {
                  cls =
                    "w-full justify-start rounded-xl border-2 border-[#1D9E75] bg-[#1D9E75] py-3 text-left font-medium text-white";
                }
                if (submitted && isSel && i !== correctIdx) {
                  cls =
                    "w-full justify-start rounded-xl border-2 border-[#E24B4A] bg-[#E24B4A] py-3 text-left font-medium text-white";
                }
                return (
                  <motion.button
                    type="button"
                    key={`${q.id}-${i}`}
                    whileHover={{ scale: isElim ? 1 : 1.02 }}
                    animate={
                      submitted && isSel && i !== correctIdx
                        ? { x: [0, -4, 4, 0] }
                        : {}
                    }
                    transition={{ duration: 0.35 }}
                    disabled={isElim || submitted}
                    onClick={() =>
                      !submitted && !isElim && setSelected(i)
                    }
                    className={`${cls} ${isElim ? "opacity-50 line-through" : ""}`}
                  >
                    <span className="mr-3 inline-flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                      {String.fromCharCode(65 + i)}
                    </span>
                    {opt}
                    {isSel ? " ✓" : ""}
                  </motion.button>
                );
              })}
            </div>
            {submitted && q.explanation ? (
              <p className="mt-4 text-sm text-muted-foreground">
                {q.explanation}
              </p>
            ) : null}
          </motion.div>
        </AnimatePresence>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {statusDots.map((d, i) => (
            <span
              key={i}
              className={`h-3 w-3 rounded-full ${
                d === "ok"
                  ? "bg-[#1D9E75]"
                  : d === "current"
                    ? "bg-[#534AB7]"
                    : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="flex justify-between gap-3">
          <Button
            variant="ghost"
            type="button"
            onClick={handleSkip}
            disabled={submitted}
          >
            Skip
          </Button>
          {!submitted ? (
            <Button
              type="button"
              className="rounded-xl px-8"
              onClick={handleSubmit}
              disabled={selected === null}
            >
              Submit Answer ➤
            </Button>
          ) : (
            <Button
              type="button"
              className="rounded-xl px-8"
              onClick={goNext}
            >
              {index + 1 >= total ? "Finish" : "Next question →"}
            </Button>
          )}
        </div>
      </section>

      <aside className="space-y-4 rounded-2xl border bg-card p-4 shadow-soft">
        <div>
          <p className="text-xs font-bold uppercase text-[#6b7280]">
            Current Streak
          </p>
          <p className="text-2xl font-bold">
            {streak} <span aria-hidden>🔥</span>
          </p>
          <p className="text-xs text-muted-foreground">
            Consecutive correct answers this quiz
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-[#F8F7FF] p-3 dark:bg-[#1a1a2e]">
          <Star className="h-6 w-6 text-[#534AB7]" />
          <div>
            <p className="text-xs font-semibold text-muted-foreground">
              XP Gained
            </p>
            <p className="text-lg font-bold text-[#534AB7]">+{xp}</p>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">
            Through question {index + 1} of {total}
          </p>
          <Progress value={progressPct} />
        </div>
        {leaderboardPeers.length > 0 ? (
          <div className="space-y-2 rounded-xl border bg-white p-3 dark:bg-[#2d2d44]">
            <p className="text-xs font-bold uppercase text-muted-foreground">
              Top learners
            </p>
            <div className="flex -space-x-2">
              {leaderboardPeers.slice(0, 3).map((peer) => (
                <Avatar
                  key={peer.displayName}
                  className="h-9 w-9 border-2 border-white dark:border-[#2d2d44]"
                  title={peer.displayName}
                >
                  {peer.avatarUrl ? (
                    <AvatarImage
                      src={peer.avatarUrl}
                      alt=""
                      className="object-cover"
                    />
                  ) : null}
                  <AvatarFallback className="text-[10px] font-bold">
                    {peer.displayName.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
