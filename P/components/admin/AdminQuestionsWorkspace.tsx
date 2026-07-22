"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trash, Edit, Plus, GripVertical } from "lucide-react";
import type { Question } from "@/components/labs/QuizPlayer";

type Props = {
  labId: string;
  subjectId: string | null;
  initialQuestions: Question[];
};

export function AdminQuestionsWorkspace({ labId, subjectId, initialQuestions }: Props) {
  const router = useRouter();
  const supabase = createClient();
  const [questions, setQuestions] = useState<Question[]>(initialQuestions);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [busy, setBusy] = useState(false);

  // Form State
  const [text, setText] = useState("");
  const [options, setOptions] = useState<string[]>(["", "", "", ""]);
  const [correctOptionIdx, setCorrectOptionIdx] = useState<number>(0);
  const [explanation, setExplanation] = useState("");
  const [points, setPoints] = useState(10);

  function resetForm() {
    setText("");
    setOptions(["", "", "", ""]);
    setCorrectOptionIdx(0);
    setExplanation("");
    setPoints(10);
    setEditingId(null);
    setIsCreating(false);
  }

  function handleEdit(q: Question) {
    setText(q.question_text);
    const opts = q.options ?? ["", "", "", ""];
    setOptions(opts.length >= 2 ? opts : [...opts, "", "", "", ""].slice(0, 4));
    
    let correctIdx = 0;
    if (q.correct_answer && q.options) {
      const idx = q.options.findIndex(
        (o) => o.trim().toLowerCase() === q.correct_answer!.trim().toLowerCase()
      );
      if (idx >= 0) correctIdx = idx;
    }
    setCorrectOptionIdx(correctIdx);
    setExplanation(q.explanation ?? "");
    setPoints(q.points ?? 10);
    setEditingId(q.id);
    setIsCreating(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this question?")) return;
    setBusy(true);
    try {
      const { error } = await supabase.from("questions").delete().eq("id", id);
      if (error) throw error;
      setQuestions((prev) => prev.filter((q) => q.id !== id));
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error deleting question");
    } finally {
      setBusy(false);
    }
  }

  async function handleSave() {
    if (!text.trim()) {
      alert("Question text is required.");
      return;
    }
    const filledOptions = options.filter(o => o.trim());
    if (filledOptions.length < 2) {
      alert("Please provide at least 2 options.");
      return;
    }
    if (!options[correctOptionIdx]?.trim()) {
      alert("The selected correct answer cannot be empty.");
      return;
    }

    setBusy(true);
    const payload = {
      lab_id: labId,
      subject_id: subjectId,
      question_text: text.trim(),
      options: filledOptions,
      correct_answer: options[correctOptionIdx].trim(),
      explanation: explanation.trim() || null,
      points,
      question_type: "mcq",
    };

    try {
      if (editingId) {
        const { data, error } = await supabase
          .from("questions")
          .update(payload)
          .eq("id", editingId)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setQuestions((prev) => prev.map((q) => (q.id === editingId ? (data as Question) : q)));
        }
      } else {
        const { data, error } = await supabase
          .from("questions")
          .insert(payload)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setQuestions((prev) => [...prev, data as Question]);
        }
      }
      resetForm();
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Error saving question");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* List of Questions */}
      <div className="space-y-4">
        {questions.length === 0 ? (
          <p className="text-sm text-muted-foreground">No questions have been added yet.</p>
        ) : (
          questions.map((q, idx) => (
            <div
              key={q.id}
              className="group flex gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:border-[#005581]/40 dark:border-white/10 dark:bg-[#0a1f2e]"
            >
              <div className="flex h-8 w-8 shrink-0 flex-col items-center justify-center rounded-full bg-muted/50 text-xs font-bold text-muted-foreground">
                {idx + 1}
              </div>
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-heading">{q.question_text}</p>
                <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                  {q.options?.map((opt, i) => (
                    <div
                      key={i}
                      className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 ${
                        opt === q.correct_answer
                          ? "border-emerald-500 bg-emerald-50 font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300"
                          : "border-transparent bg-slate-100 dark:bg-white/5"
                      }`}
                    >
                      <span className="text-[10px] font-bold uppercase opacity-50">
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="truncate">{opt}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2">
                <Button variant="ghost" size="icon" onClick={() => handleEdit(q)} disabled={busy}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(q.id)} disabled={busy}>
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Editor Form */}
      {isCreating || editingId ? (
        <div className="rounded-2xl border bg-muted/30 p-6">
          <h2 className="mb-4 text-lg font-bold">
            {editingId ? "Edit Question" : "New Question"}
          </h2>
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label>Question Text</Label>
              <Textarea
                placeholder="What is the output of..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={3}
              />
            </div>
            
            <div className="space-y-3">
              <Label>Options</Label>
              {options.map((opt, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold transition-all hover:scale-105 ${
                      correctOptionIdx === i
                        ? "border-emerald-500 bg-emerald-500 text-white shadow-md shadow-emerald-500/20"
                        : "border-slate-300 text-slate-500 hover:border-emerald-400/50 dark:border-white/20 dark:text-slate-400"
                    }`}
                    onClick={() => setCorrectOptionIdx(i)}
                    title="Mark as correct answer"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                  <Input
                    placeholder={`Option ${i + 1}`}
                    value={opt}
                    onChange={(e) => {
                      const copy = [...options];
                      copy[i] = e.target.value;
                      setOptions(copy);
                    }}
                    className={correctOptionIdx === i ? "border-emerald-500/40 focus-visible:ring-emerald-500 bg-emerald-50/30 dark:bg-emerald-500/5" : "hover:border-[#72CDF4] transition-colors"}
                  />
                </div>
              ))}
              <p className="text-xs text-muted-foreground">
                Click the letter circle to mark an option as the correct answer. Empty options will be ignored.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>Explanation (Optional)</Label>
                <Textarea
                  placeholder="Explain why this is correct..."
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  rows={2}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Points</Label>
                <Input
                  type="number"
                  min={1}
                  value={points}
                  onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                />
              </div>
            </div>

            <div className="mt-4 flex gap-3 justify-end">
              <Button variant="ghost" onClick={resetForm} disabled={busy}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={busy}>
                {busy ? "Saving..." : "Save Question"}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsCreating(true)} className="w-full gap-2 border-dashed bg-transparent text-[#005581] hover:bg-[#005581]/5" variant="outline">
          <Plus className="h-4 w-4" /> Add Question
        </Button>
      )}
    </div>
  );
}
