"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import type { Question } from "@/components/labs/QuizPlayer";

export function QuestionCard({
  question,
  index,
  total,
  onSubmit,
}: {
  question: Question;
  index: number;
  total: number;
  onSubmit: (choice: string) => void;
}) {
  const options = question.options ?? [];

  return (
    <div className="rounded-2xl border bg-card p-6 shadow-soft">
      <p className="text-xs font-semibold uppercase text-[#005581]">
        Question {index}/{total}
      </p>
      <h3 className="mt-2 text-lg font-bold text-heading">
        {question.question_text}
      </h3>
      <div className="mt-4 space-y-2">
        {options.map((opt, i) => (
          <motion.div key={opt} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Button
              type="button"
              variant="outline"
              className="h-auto w-full justify-start rounded-xl border-[#005581]/40 py-3 text-left font-medium text-heading"
              onClick={() => onSubmit(opt)}
            >
              <span className="mr-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#005581]/10 text-xs font-bold text-[#005581]">
                {String.fromCharCode(65 + i)}
              </span>
              {opt}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
