"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ExternalLink } from "lucide-react";

export type AdminLabRow = {
  id: string;
  title: string;
  subject_id: string | null;
};

type SubjectOpt = { id: string; name: string };

type Props = {
  labs: AdminLabRow[];
  subjects: SubjectOpt[];
};

function LabEditorRow({ lab, subjects }: { lab: AdminLabRow; subjects: SubjectOpt[] }) {
  const router = useRouter();
  const supabase = createClient();
  const [title, setTitle] = useState(lab.title);
  const [subjectId, setSubjectId] = useState(lab.subject_id ?? "");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setTitle(lab.title);
    setSubjectId(lab.subject_id ?? "");
  }, [lab.id, lab.title, lab.subject_id]);

  const previewSubjectId = subjectId || lab.subject_id;
  const previewHref =
    previewSubjectId && lab.id
      ? `/labs/${previewSubjectId}/${lab.id}`
      : null;

  async function save() {
    const trimmed = title.trim();
    if (!trimmed) {
      alert("Lab title is required.");
      return;
    }
    const nextSubject = subjectId || null;
    setBusy(true);
    try {
      const { data: updated, error: labErr } = await supabase
        .from("labs")
        .update({ title: trimmed, subject_id: nextSubject })
        .eq("id", lab.id)
        .select("id, title, subject_id");
      if (labErr) throw labErr;
      if (!updated?.length) {
        throw new Error(
          "Lab was not updated. Confirm you are signed in as an admin (profiles.role = 'admin')."
        );
      }

      const { error: qErr } = await supabase
        .from("questions")
        .update({ subject_id: nextSubject })
        .eq("lab_id", lab.id);
      if (qErr) throw qErr;

      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Could not save lab");
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border bg-white p-4 dark:border-white/10 dark:bg-[#2d2d44]">
      <div className="grid gap-3 sm:grid-cols-[1fr_200px_auto] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor={`lab-title-${lab.id}`}>Lab title</Label>
          <Input
            id={`lab-title-${lab.id}`}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={busy}
          />
        </div>
        <div className="space-y-1.5">
          <Label>Subject</Label>
          <Select
            value={subjectId || "__none__"}
            onValueChange={(v) => setSubjectId(v === "__none__" ? "" : v)}
            disabled={busy}
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue placeholder="No subject" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">— None —</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          <Button type="button" size="sm" onClick={() => void save()} disabled={busy}>
            Save
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/admin/labs/${lab.id}`} className="gap-1 text-[#534AB7] border-[#534AB7]/30">
              Edit Questions
            </Link>
          </Button>
          {previewHref ? (
            <Button variant="outline" size="sm" asChild>
              <Link href={previewHref} className="gap-1">
                <ExternalLink className="h-3.5 w-3.5" />
                Open
              </Link>
            </Button>
          ) : null}
        </div>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        To rename how a subject appears everywhere, go to{" "}
        <Link href="/admin/subjects" className="font-semibold text-[#534AB7] underline">
          Subjects
        </Link>
        .
      </p>
    </li>
  );
}

export function AdminLabsWorkspace({ labs, subjects }: Props) {
  return (
    <ul className="space-y-3">
      {labs.map((lab) => (
        <LabEditorRow key={lab.id} lab={lab} subjects={subjects} />
      ))}
    </ul>
  );
}
