"use client";

import { motion } from "framer-motion";

type Section = { heading: string; body: string };

export function TheorySection({ sections }: { sections: Section[] }) {
  return (
    <div className="space-y-6">
      {sections.map((s, i) => (
        <motion.article
          key={`${s.heading}-${i}`}
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
          className="rounded-2xl border bg-card p-5 shadow-sm"
        >
          <h3 className="text-lg font-bold text-[#534AB7]">{s.heading}</h3>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
            {s.body}
          </p>
        </motion.article>
      ))}
    </div>
  );
}
