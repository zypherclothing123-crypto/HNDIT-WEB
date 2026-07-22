"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Lightbulb, Star, Clock, Trophy } from "lucide-react";
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
  const router = useRouter();
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
    router.refresh();
  }, [labId, playable, supabase, xp, user, router]);

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
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", damping: 20, stiffness: 100 }}
        className="rounded-3xl border-2 border-[#ffd200]/30 bg-gradient-to-b from-white to-slate-50 p-10 text-center shadow-xl dark:from-[#0a1f2e] dark:to-[#05131e]"
      >
        <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#ffd200]/20">
          <Trophy className="h-12 w-12 text-[#ffd200]" />
        </div>
        <h2 className="text-3xl font-extrabold text-[#005581] dark:text-white">
          Quiz Completed!
        </h2>
        <div className="my-8 flex justify-center gap-8">
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Accuracy</p>
            <p className="text-4xl font-black text-heading">
              {attempts > 0 ? Math.round((correctCount / attempts) * 100) : 0}%
            </p>
            <p className="text-sm text-muted-foreground">{correctCount} of {attempts} correct</p>
          </div>
          <div className="w-px bg-border"></div>
          <div className="space-y-2">
            <p className="text-sm font-bold uppercase tracking-wider text-muted-foreground">XP Earned</p>
            <p className="text-4xl font-black text-[#ffd200]">+{xp}</p>
            <p className="text-sm text-muted-foreground">Total Score</p>
          </div>
        </div>
        
        {labId ? (
          <p className="mb-8 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            ✓ Progress saved to your lab profile
          </p>
        ) : null}

        <Button
          onClick={() => window.location.href = "/dashboard"}
          className="rounded-xl bg-[#005581] px-10 py-6 text-lg font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#ffd200] hover:text-[#001824]"
        >
          Return to Dashboard
        </Button>
      </motion.div>
    );
  }

  const options = q.options ?? [];

  return (
    <div className="grid gap-4 text-heading lg:grid-cols-[260px_1fr_260px]">
      <aside className="space-y-4">
        {/* Progress Card */}
        <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-md dark:border-white/5 dark:bg-[#0a1f2e]">
          <p className="text-xs font-black uppercase tracking-widest text-[#72CDF4]">
            Current Progress
          </p>
          <div className="mt-2 flex items-end gap-2">
            <span className="text-4xl font-black text-[#005581] dark:text-white">{index + 1}</span>
            <span className="mb-1 text-lg font-bold text-muted-foreground">/ {total}</span>
          </div>
          
          <div className="my-6 space-y-2">
            <p className="text-xs font-bold text-muted-foreground">Topic</p>
            <p className="font-bold leading-tight text-heading">{topicLabel}</p>
            {subtitle ? (
              <p className="text-xs font-medium text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between text-sm font-bold">
              <span>Accuracy</span>
              <span className={accuracyPct >= 80 ? "text-emerald-500" : "text-heading"}>{attempts ? `${accuracyPct}%` : "—"}</span>
            </div>
            <Progress value={attempts ? accuracyPct : 0} className="h-3" />
          </div>
        </div>

        {/* Lifelines Card */}
        <div className="rounded-3xl border-2 border-dashed border-[#ffd200]/50 bg-gradient-to-br from-[#ffd200]/5 to-transparent p-6 dark:from-[#ffd200]/10">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#ffd200]/20">
              <Lightbulb className="h-5 w-5 text-[#ffd200]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[#ffd200]">Lifelines</p>
              <p className="text-sm font-bold">{hintsLeft} remaining</p>
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full gap-2 rounded-xl border-2 border-[#ffd200]/50 bg-white py-6 font-bold hover:bg-[#ffd200] hover:text-[#001824] dark:bg-[#05131e] transition-all hover:scale-105"
            type="button"
            onClick={applyHint}
            disabled={hintsLeft === 0 || submitted}
          >
            Use a Hint (50/50)
          </Button>
        </div>
      </aside>

      <section className="flex flex-col gap-4">
        {/* Top Header / Timer */}
        <div className="flex items-center justify-between rounded-3xl border-2 border-slate-100 bg-white px-6 py-4 shadow-md dark:border-white/5 dark:bg-[#0a1f2e]">
          <div className="flex items-center gap-4 flex-1 mr-8">
            <span className="rounded-full bg-[#005581]/10 px-4 py-1.5 text-xs font-black uppercase tracking-wider text-[#005581] dark:bg-[#72CDF4]/20 dark:text-[#72CDF4]">
              Practice Quiz
            </span>
            <Progress value={progressPct} className="h-2.5 flex-1" />
          </div>
          <div
            className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-black transition-colors ${
              seconds < 30 ? "animate-pulse bg-red-100 text-red-600 dark:bg-red-900/30" : "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-white"
            }`}
          >
            <Clock className="h-4 w-4" />
            {mm}:{ss}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={q.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex-1 rounded-3xl border-2 border-slate-100 bg-white p-8 shadow-lg dark:border-white/5 dark:bg-[#0a1f2e]"
          >
            <h2 className="mb-8 text-2xl font-bold leading-relaxed text-heading">{q.question_text}</h2>
            <div className="grid gap-3">
              {options.map((opt, i) => {
                const isSel = selected === i;
                const isElim = eliminated.has(i);
                
                // Styling logic
                let containerCls = "relative w-full rounded-2xl border-2 border-slate-200 bg-white p-4 text-left transition-all hover:border-[#72CDF4] hover:shadow-md dark:border-white/10 dark:bg-[#05131e] dark:hover:border-[#72CDF4]";
                let textCls = "text-lg font-semibold text-slate-700 dark:text-slate-300";
                let badgeCls = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500 transition-colors dark:bg-white/10 dark:text-slate-400";

                if (isSel) {
                  containerCls = "relative w-full rounded-2xl border-2 border-[#005581] bg-[#005581]/5 p-4 text-left shadow-md dark:bg-[#005581]/20";
                  textCls = "text-lg font-bold text-[#005581] dark:text-white";
                  badgeCls = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#005581] text-sm font-bold text-white";
                }
                if (submitted && i === correctIdx) {
                  containerCls = "relative w-full rounded-2xl border-2 border-emerald-500 bg-emerald-50 p-4 text-left shadow-lg dark:bg-emerald-500/20";
                  textCls = "text-lg font-bold text-emerald-700 dark:text-emerald-300";
                  badgeCls = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold text-white";
                }
                if (submitted && isSel && i !== correctIdx) {
                  containerCls = "relative w-full rounded-2xl border-2 border-rose-500 bg-rose-50 p-4 text-left dark:bg-rose-500/20";
                  textCls = "text-lg font-bold text-rose-700 dark:text-rose-300";
                  badgeCls = "flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose-500 text-sm font-bold text-white";
                }

                return (
                  <motion.button
                    type="button"
                    key={`${q.id}-${i}`}
                    whileHover={{ scale: isElim || submitted ? 1 : 1.02 }}
                    whileTap={{ scale: isElim || submitted ? 1 : 0.98 }}
                    animate={
                      submitted && isSel && i !== correctIdx
                        ? { x: [0, -6, 6, -6, 6, 0] }
                        : submitted && i === correctIdx 
                        ? { scale: [1, 1.03, 1] } 
                        : {}
                    }
                    transition={{ duration: 0.3 }}
                    disabled={isElim || submitted}
                    onClick={() => !submitted && !isElim && setSelected(i)}
                    className={`${containerCls} flex items-center gap-4 ${isElim ? "opacity-40 grayscale" : ""}`}
                  >
                    <span className={badgeCls}>
                      {String.fromCharCode(65 + i)}
                    </span>
                    <span className={textCls}>{opt}</span>
                    {submitted && i === correctIdx && (
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute right-4 text-emerald-500">
                        ✓
                      </motion.div>
                    )}
                  </motion.button>
                );
              })}
            </div>
            
            <AnimatePresence>
              {submitted && q.explanation && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="mt-6 rounded-2xl bg-slate-50 p-5 dark:bg-white/5"
                >
                  <p className="text-sm font-bold uppercase tracking-wider text-[#005581] dark:text-[#72CDF4]">Explanation</p>
                  <p className="mt-2 font-medium leading-relaxed text-slate-700 dark:text-slate-300">
                    {q.explanation}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between gap-4 rounded-3xl border-2 border-slate-100 bg-white p-4 shadow-md dark:border-white/5 dark:bg-[#0a1f2e]">
          <div className="flex gap-1.5 px-4 hidden sm:flex">
            {statusDots.map((d, i) => (
              <span
                key={i}
                className={`h-2.5 w-2.5 rounded-full transition-all ${
                  d === "ok" ? "bg-emerald-500 scale-100" : d === "current" ? "bg-[#005581] scale-125 dark:bg-[#72CDF4]" : "bg-slate-200 dark:bg-white/10"
                }`}
              />
            ))}
          </div>
          
          <div className="flex flex-1 justify-end gap-3">
            <Button variant="ghost" type="button" onClick={handleSkip} disabled={submitted} className="rounded-xl px-6 font-bold">
              Skip
            </Button>
            {!submitted ? (
              <Button type="button" className="rounded-xl bg-[#005581] px-10 py-6 text-base font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-[#ffd200] hover:text-[#001824]" onClick={handleSubmit} disabled={selected === null}>
                Submit Answer
              </Button>
            ) : (
              <Button type="button" className="rounded-xl bg-emerald-600 px-10 py-6 text-base font-bold text-white shadow-lg transition-all hover:scale-105" onClick={goNext}>
                {index + 1 >= total ? "Finish Quiz 🏆" : "Next Question →"}
              </Button>
            )}
          </div>
        </div>
      </section>

      <aside className="space-y-4">
        {/* Streak Card */}
        <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-md dark:border-white/5 dark:bg-[#0a1f2e]">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${streak > 2 ? 'bg-orange-100 animate-bounce' : 'bg-slate-100 dark:bg-white/10'}`}>
              <span className="text-2xl" aria-hidden>🔥</span>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">Streak</p>
              <p className="text-3xl font-black text-heading">{streak}</p>
            </div>
          </div>
        </div>

        {/* XP Card */}
        <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-md dark:border-white/5 dark:bg-[#0a1f2e]">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#005581]/10">
              <Star className="h-6 w-6 text-[#005581] dark:text-[#72CDF4]" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-muted-foreground">XP Gained</p>
              <p className="text-3xl font-black text-[#005581] dark:text-[#72CDF4]">+{xp}</p>
            </div>
          </div>
        </div>

        {/* Leaderboard Card */}
        {leaderboardPeers.length > 0 ? (
          <div className="rounded-3xl border-2 border-slate-100 bg-white p-6 shadow-md dark:border-white/5 dark:bg-[#0a1f2e]">
            <p className="mb-4 text-xs font-black uppercase tracking-widest text-muted-foreground">Top Learners</p>
            <div className="flex flex-col gap-3">
              {leaderboardPeers.slice(0, 3).map((peer, i) => (
                <div key={peer.displayName} className="flex items-center gap-3 rounded-xl bg-slate-50 p-2 dark:bg-white/5">
                  <span className="w-4 text-center text-xs font-bold text-muted-foreground">{i + 1}</span>
                  <Avatar className="h-8 w-8 border-2 border-white dark:border-[#0a1f2e]" title={peer.displayName}>
                    {peer.avatarUrl ? <AvatarImage src={peer.avatarUrl} alt="" className="object-cover" /> : null}
                    <AvatarFallback className="text-[10px] font-bold text-[#005581]">{peer.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate text-sm font-bold text-heading">{peer.displayName}</span>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  );
}
