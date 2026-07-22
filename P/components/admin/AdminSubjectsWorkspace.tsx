"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SubjectManagementGrid, type SubjectCardAdmin } from "@/components/admin/SubjectManagementGrid";
import { ToastPortal } from "@/components/ui/ToastNotification";
import { useToast } from "@/lib/hooks/useToast";

type Props = {
  initialStats: SubjectCardAdmin[];
};

export function AdminSubjectsWorkspace({ initialStats }: Props) {
  const router = useRouter();
  const toast = useToast();

  const [stats, setStats] = useState(initialStats);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [addName, setAddName] = useState("");
  const [addYear, setAddYear] = useState(1);
  const [addSem, setAddSem] = useState(1);

  const selected = useMemo(
    () => stats.find((s) => s.id === selectedId) ?? null,
    [stats, selectedId]
  );

  const [editName, setEditName] = useState("");
  const [editYear, setEditYear] = useState(1);
  const [editSem, setEditSem] = useState(1);
  const [editCode, setEditCode] = useState("");

  useEffect(() => {
    setStats(initialStats);
  }, [initialStats]);

  useEffect(() => {
    if (selectedId) {
      document
        .getElementById("subject-manage-panel")
        ?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [selectedId]);

  useEffect(() => {
    if (!selected) return;
    setEditName(selected.name);
    setEditYear(selected.year);
    setEditSem(selected.semester);
    setEditCode(selected.code ?? "");
  }, [selected]);

  function openEdit(s: SubjectCardAdmin) {
    setSelectedId(s.id);
    setEditName(s.name);
    setEditYear(s.year);
    setEditSem(s.semester);
    setEditCode(s.code ?? "");
  }

  // ── Add ──────────────────────────────────────────────────────────────────
  async function addSubject() {
    if (!addName.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: addName.trim(), year: addYear, semester: addSem }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not add subject");

      const newSubject = json.subject;
      setStats((prev) => [
        ...prev,
        {
          id: newSubject.id,
          name: newSubject.name,
          year: newSubject.year,
          semester: newSubject.semester,
          code: newSubject.code ?? null,
          labCount: 0,
          learnerCount: 0,
          questionCount: 0,
          materialCount: 0,
        },
      ]);
      setAddName("");
      toast.success(
        "Subject added!",
        `"${newSubject.name}" was successfully added to Year ${newSubject.year}, Semester ${newSubject.semester}.`
      );
      router.refresh();
    } catch (e) {
      toast.error(
        "Failed to add subject",
        e instanceof Error ? e.message : "An unexpected error occurred."
      );
    } finally {
      setBusy(false);
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  async function saveSubject() {
    if (!selectedId) return;
    const name = editName.trim();
    if (!name) {
      toast.error("Validation error", "Subject name is required.");
      return;
    }
    setBusy(true);
    try {
      const res = await fetch("/api/admin/subjects", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedId,
          name,
          year: editYear,
          semester: editSem,
          code: editCode.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Update failed");

      const row = json.subject;
      setStats((prev) =>
        prev.map((s) =>
          s.id === selectedId
            ? { ...s, name: row.name, year: row.year, semester: row.semester, code: row.code ?? null }
            : s
        )
      );
      toast.success("Changes saved!", `"${row.name}" has been updated.`);
      router.refresh();
    } catch (e) {
      toast.error(
        "Failed to save changes",
        e instanceof Error ? e.message : "An unexpected error occurred."
      );
    } finally {
      setBusy(false);
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────
  async function deleteSubject() {
    if (!selectedId || !selected) return;
    const ok = window.confirm(
      `Delete "${selected.name}"? All labs and quiz questions for this subject will be removed (cascade).`
    );
    if (!ok) return;
    setBusy(true);
    const deletedName = selected.name;
    try {
      const res = await fetch(`/api/admin/subjects?id=${selectedId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Delete failed");

      setStats((prev) => prev.filter((s) => s.id !== selectedId));
      setSelectedId(null);
      toast.success("Subject deleted", `"${deletedName}" has been removed.`);
      router.refresh();
    } catch (e) {
      toast.error(
        "Failed to delete subject",
        e instanceof Error ? e.message : "An unexpected error occurred."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Toast notifications portal */}
      <ToastPortal toasts={toast.toasts} onDismiss={toast.dismiss} />

      <div className="space-y-10">
        {/* ── Add Subject form ── */}
        <div className="rounded-2xl border bg-white p-5 shadow-soft dark:border-white/10 dark:bg-[#0a1f2e]">
          <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-heading">
            Add subject
          </h2>
          <div className="flex flex-wrap items-end gap-2">
            <div className="space-y-1">
              <Label htmlFor="new-name" className="text-xs">Name</Label>
              <Input
                id="new-name"
                placeholder="Subject name"
                value={addName}
                onChange={(e) => setAddName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") void addSubject(); }}
                className="max-w-xs"
                disabled={busy}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-year" className="text-xs">Year</Label>
              <Input
                id="new-year"
                type="number"
                min={1}
                max={4}
                value={addYear}
                onChange={(e) => setAddYear(Number(e.target.value))}
                className="w-20"
                disabled={busy}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new-sem" className="text-xs">Semester</Label>
              <Input
                id="new-sem"
                type="number"
                min={1}
                max={2}
                value={addSem}
                onChange={(e) => setAddSem(Number(e.target.value))}
                className="w-20"
                disabled={busy}
              />
            </div>
            <Button
              type="button"
              onClick={() => void addSubject()}
              disabled={busy || !addName.trim()}
            >
              {busy ? "Adding…" : "Add subject"}
            </Button>
          </div>
        </div>

        {/* ── Subject grid ── */}
        <SubjectManagementGrid
          subjects={stats}
          interactive
          selectedId={selectedId}
          onSelect={(id) => {
            const s = stats.find((x) => x.id === id);
            if (s) openEdit(s);
          }}
          showHeaderActions={false}
        />

        {/* ── Edit panel ── */}
        {selected ? (
          <div
            className="rounded-2xl border-2 border-[#005581]/30 bg-white p-6 shadow-soft dark:border-white/10 dark:bg-[#0a1f2e]"
            id="subject-manage-panel"
          >
            <h3 className="text-lg font-bold text-heading">Manage: {selected.name}</h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Update metadata or delete this subject. Deleting removes linked labs and questions.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="edit-name">Name</Label>
                <Input
                  id="edit-name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  disabled={busy}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-code">Code</Label>
                <Input
                  id="edit-code"
                  value={editCode}
                  onChange={(e) => setEditCode(e.target.value)}
                  disabled={busy}
                  placeholder="e.g. Y1S1-PF"
                />
              </div>
              <div className="flex gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="edit-y">Year</Label>
                  <Input
                    id="edit-y"
                    type="number"
                    min={1}
                    max={4}
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    disabled={busy}
                    className="w-20"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="edit-s">Semester</Label>
                  <Input
                    id="edit-s"
                    type="number"
                    min={1}
                    max={2}
                    value={editSem}
                    onChange={(e) => setEditSem(Number(e.target.value))}
                    disabled={busy}
                    className="w-20"
                  />
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              <Button type="button" onClick={() => void saveSubject()} disabled={busy}>
                {busy ? "Saving…" : "Save changes"}
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={busy}
                onClick={() => setSelectedId(null)}
              >
                Clear selection
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={busy}
                onClick={() => void deleteSubject()}
              >
                Delete subject
              </Button>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
