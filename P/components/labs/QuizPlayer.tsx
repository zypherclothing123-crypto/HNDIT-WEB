"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { saveLabQuizProgress } from "@/lib/quiz-progress";

export type Question = {
  id: string;
  question_text: string;
  options: string[] | null;
  correct_answer: string | null;
  explanation?: string | null;
  question_type?: string | null;
  points?: number | null;
};

export function QuizPlayer({
  labId,
  questions,
}: {
  labId: string;
  questions: Question[];
}) {
  const supabase = createClient();
  const [userId, setUserId] = useState<string | null>(null);
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const totalPoints = useMemo(
    () => questions.reduce((a, q) => a + (q.points ?? 10), 0),
    [questions]
  );

  const q = questions[index];

  async function submitAnswer(choice: string) {
    if (!q) return;
    const correct =
      (q.correct_answer ?? "").trim().toLowerCase() ===
      choice.trim().toLowerCase();
    const pts = correct ? q.points ?? 10 : 0;
    const nextScore = score + pts;
    setScore(nextScore);

    const next = index + 1;
    if (next >= questions.length) {
      setFinished(true);

      if (userId) {
        await saveLabQuizProgress(
          supabase,
          userId,
          labId,
          nextScore,
          totalPoints
        );
      }
    } else {
      setIndex(next);
    }
  }

  if (!questions.length) {
    return (
      <p className="text-sm text-muted-foreground">
        No quiz items for this lab yet.
      </p>
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
          You scored {score} / {totalPoints}
        </h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Progress saved to your transcript.
        </p>
      </motion.div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={q.id}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
      >
        <QuestionCard
          index={index + 1}
          total={questions.length}
          question={q}
          onSubmit={submitAnswer}
        />
        <div className="mt-4 flex justify-between text-xs text-muted-foreground">
          <span>
            Question {index + 1} of {questions.length}
          </span>
          <span>Running score: {score}</span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
