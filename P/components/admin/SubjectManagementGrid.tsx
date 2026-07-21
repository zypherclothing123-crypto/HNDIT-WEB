"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Pencil, BookOpen, Eye } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export type SubjectCardAdmin = {
  id: string;
  name: string;
  year: number;
  semester: number;
  code?: string | null;
  labCount: number;
  learnerCount: number;
  questionCount: number;
  materialCount: number;
  gradient?: string;
};

const gradients = [
  "from-[#534AB7] via-[#6B5FD6] to-[#1a1a2e]",
  "from-[#EF9F27] via-[#534AB7] to-[#1a1a2e]",
  "from-[#1D9E75] via-[#534AB7] to-[#1a1a2e]",
  "from-[#6dd5ed] via-[#534AB7] to-[#1a1a2e]",
];

type Props = {
  subjects: SubjectCardAdmin[];
  /** Subjects page: click card to select for edit/delete panel. */
  interactive?: boolean;
  selectedId?: string | null;
  onSelect?: (id: string) => void;
  showHeaderActions?: boolean;
};

export function SubjectManagementGrid({
  subjects,
  interactive = false,
  selectedId = null,
  onSelect,
  showHeaderActions = true,
}: Props) {
  return (
    <section className="space-y-4">
      {showHeaderActions ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-lg font-bold text-heading">Subject Management</h3>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full border-dashed">
              Filter
            </Button>
            <Button asChild className="rounded-full">
              <Link href="/admin/subjects">+ Add Subject</Link>
            </Button>
          </div>
        </div>
      ) : (
        <h3 className="text-lg font-bold text-heading">Subject Management</h3>
      )}
      <p className="text-sm text-muted-foreground">
        {interactive
          ? "Select a subject card to update details or delete it. Preview labs without selecting."
          : "Quick overview — open Subject Manager for full tools."}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {subjects.map((s, i) => {
          const selected = selectedId === s.id;
          return (
            <motion.div
              key={s.id}
              role={interactive ? "button" : undefined}
              tabIndex={interactive ? 0 : undefined}
              onClick={
                interactive && onSelect
                  ? () => onSelect(s.id)
                  : undefined
              }
              onKeyDown={
                interactive && onSelect
                  ? (e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        onSelect(s.id);
                      }
                    }
                  : undefined
                  }
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.04 * i }}
              className={cn(
                `relative overflow-hidden rounded-2xl bg-gradient-to-br p-5 text-white shadow-soft ${s.gradient ?? gradients[i % gradients.length]}`,
                interactive && "cursor-pointer transition-transform hover:scale-[1.02]",
                interactive &&
                  selected &&
                  "ring-4 ring-white/90 ring-offset-2 ring-offset-[#F8F7FF] dark:ring-offset-[#1a1a2e]"
              )}
            >
              {!interactive ? (
                <Link
                  href={`/labs/${s.id}`}
                  className="absolute inset-0 z-10 rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
                  aria-label={`Open labs for ${s.name}`}
                />
              ) : null}
              <p className="relative z-0 text-[10px] font-bold uppercase text-white/80">
                Year {s.year} • Sem {s.semester}
              </p>
              <h4 className="relative z-0 mt-3 text-lg font-bold leading-snug">
                {s.name}
              </h4>
              <div className="relative z-0 mt-6 space-y-2 text-xs font-medium text-white/95">
                <p>
                  <span className="font-bold text-white">{s.labCount}</span> labs
                  {" · "}
                  <span className="font-bold text-white">
                    {s.learnerCount}
                  </span>{" "}
                  learners with activity
                </p>
                <p>
                  <span className="font-bold text-white">{s.questionCount}</span>{" "}
                  quiz questions
                  {" · "}
                  <span className="font-bold text-white">
                    {s.materialCount}
                  </span>{" "}
                  uploads
                </p>
              </div>
              <div className="relative z-20 mt-4 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wide">
                {!interactive ? (
                  <Link
                    href="/admin/subjects"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20"
                  >
                    <Pencil className="h-3 w-3" /> Manage
                  </Link>
                ) : (
                  <span className="flex items-center gap-1 rounded-lg bg-white/20 px-2 py-1 text-white">
                    <Pencil className="h-3 w-3" /> Tap to manage
                  </span>
                )}
                <Link
                  href={`/labs/${s.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 rounded-lg bg-white/10 px-2 py-1 hover:bg-white/20"
                >
                  <BookOpen className="h-3 w-3" /> Labs
                </Link>
                <Link
                  href={`/labs/${s.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="rounded-lg bg-white/10 p-1 hover:bg-white/20"
                  aria-label="Preview subject labs"
                >
                  <Eye className="h-3 w-3" />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
