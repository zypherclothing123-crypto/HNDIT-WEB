"use client";

import { motion } from "framer-motion";

type Step = { step: number; title: string; detail: string };

export function PracticalSteps({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative space-y-4 border-l-2 border-[#005581]/30 pl-6">
      {steps.map((step, i) => (
        <motion.li
          key={step.step}
          initial={{ opacity: 0, x: -8 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.06 }}
          className="relative"
        >
          <span className="absolute -left-[31px] flex h-8 w-8 items-center justify-center rounded-full bg-[#005581] text-xs font-bold text-white">
            {step.step}
          </span>
          <div className="rounded-2xl border bg-card p-4 shadow-sm">
            <h4 className="font-semibold text-heading">{step.title}</h4>
            <p className="mt-1 text-sm text-muted-foreground">{step.detail}</p>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}
