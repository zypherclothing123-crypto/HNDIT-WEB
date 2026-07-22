"use client";

import { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { CloudUpload, ScanSearch } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
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
    <section className="rounded-2xl border bg-white p-6 shadow-soft dark:border-white/10 dark:bg-[#0a1f2e]">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-bold text-heading">Upload Content</h2>
        <Badge variant="secondary" className="bg-[#005581]/10 text-[#005581]">
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
        className={`relative overflow-hidden flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-4 py-10 text-center transition-colors ${
          isDragActive
            ? "border-[#005581] bg-[#005581]/5"
            : busy 
            ? "border-[#72CDF4] bg-[#72CDF4]/5"
            : "border-[#d4d4e8] bg-[#FFFFFA]/80 dark:border-white/20 dark:bg-[#05131e]/60"
        }`}
      >
        <input {...getInputProps()} disabled={busy} />
        
        <AnimatePresence mode="wait">
          {busy ? (
            <motion.div
              key="busy"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center"
            >
              <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#005581]/10">
                <ScanSearch className="h-8 w-8 text-[#005581]" />
                <motion.div
                  className="absolute inset-0 rounded-2xl border-2 border-[#72CDF4]"
                  animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              </div>
              <p className="text-sm font-bold text-heading">
                AI Analyzer Active
              </p>
              <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                Extracting knowledge and generating HNDIT lab modules...
              </p>
              <motion.div 
                className="mt-6 h-1.5 w-48 overflow-hidden rounded-full bg-slate-100 dark:bg-white/10"
              >
                <motion.div 
                  className="h-full bg-gradient-to-r from-[#005581] to-[#72CDF4]"
                  animate={{ x: ["-100%", "100%"] }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              key="idle"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center"
            >
              <CloudUpload className="mb-3 h-12 w-12 text-[#005581]" />
              <p className="text-sm font-semibold text-heading">
                Drag and drop course material
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                PDF, PPTX, or DOCX (Max 20MB). AI extraction optimized for PDF.
              </p>
              <Button
                type="button"
                className="mt-6 rounded-full px-8 bg-[#001824] hover:bg-[#003855] text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  open();
                }}
              >
                Browse Files
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {message && !busy && (
          <p className="absolute bottom-4 text-xs font-medium text-[#005581]">
            {message}
          </p>
        )}
      </div>
    </section>
  );
}
