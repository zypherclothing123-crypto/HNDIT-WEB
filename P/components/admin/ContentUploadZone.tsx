"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
const authedFetch = fetch;

type Props = {
  subjects: { id: string; name: string; year: number; semester: number }[];
  onUploaded?: () => void;
};

/**
 * Drag/drop zone + year/sem/subject selectors. Calls /api/analyze with FormData.
 */
export function ContentUploadZone({ subjects, onUploaded }: Props) {
  const [year, setYear] = useState("1");
  const [semester, setSemester] = useState("1");
  const [subjectId, setSubjectId] = useState<string | undefined>(
    subjects[0]?.id
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const filtered = subjects.filter(
    (s) => String(s.year) === year && String(s.semester) === semester
  );

  useEffect(() => {
    const first = subjects.find(
      (s) => String(s.year) === year && String(s.semester) === semester
    );
    if (first) setSubjectId(first.id);
  }, [year, semester, subjects]);

  const onDrop = useCallback(
    async (files: File[]) => {
      const file = files[0];
      if (!file || !subjectId) return;
      setBusy(true);
      setMessage(null);
      try {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("subjectId", subjectId);
        const res = await authedFetch("/api/analyze", { method: "POST", body: fd });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Upload failed");
        if (json.labId) {
          setMessage("Upload complete. AI has successfully generated the lab modules.");
        } else if (json.message) {
          setMessage(json.message);
        } else {
          setMessage("Upload complete.");
        }
        onUploaded?.();
      } catch (e) {
        setMessage(e instanceof Error ? e.message : "Error during AI generation.");
      } finally {
        setBusy(false);
      }
    },
    [subjectId, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 20 * 1024 * 1024,
    noClick: true,
    noKeyboard: true,
  });

  return (
    <section className="rounded-2xl border bg-white p-6 shadow-soft dark:border-white/10 dark:bg-[#2d2d44]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-heading">Upload Content</h2>
        <Badge variant="secondary" className="bg-[#534AB7]/10 text-[#534AB7]">
          LUMINA CORE
        </Badge>
      </div>

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Select
          value={year}
          onValueChange={(v) => {
            setYear(v);
            setSubjectId(undefined);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Year 1</SelectItem>
            <SelectItem value="2">Year 2</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={semester}
          onValueChange={(v) => {
            setSemester(v);
            setSubjectId(undefined);
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Semester" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Semester 1</SelectItem>
            <SelectItem value="2">Semester 2</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={subjectId ?? ""}
          onValueChange={setSubjectId}
          disabled={!filtered.length}
        >
          <SelectTrigger>
            <SelectValue placeholder="Subject" />
          </SelectTrigger>
          <SelectContent>
            {filtered.map((s) => (
              <SelectItem key={s.id} value={s.id}>
                {s.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div
        {...getRootProps()}
        className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
          isDragActive
            ? "border-[#534AB7] bg-[#534AB7]/5"
            : "border-[#d4d4e8] bg-[#F8F7FF]/80 dark:border-white/20 dark:bg-[#1a1a2e]/60"
        }`}
      >
        <input {...getInputProps()} />
        <CloudUpload className="mb-3 h-12 w-12 text-[#534AB7]" />
        <p className="text-sm font-semibold text-heading">
          Drag and drop course material
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF, PPTX, or DOCX (Max 20MB). AI extraction optimized for PDF.
        </p>
        <Button
          type="button"
          className="mt-6 rounded-full px-8"
          disabled={busy}
          onClick={(e) => {
            e.stopPropagation();
            open();
          }}
        >
          {busy ? "Processing..." : "Browse Files"}
        </Button>
        {message ? (
          <p className="mt-4 text-xs font-medium text-[#534AB7]">{message}</p>
        ) : null}
      </div>
    </section>
  );
}
