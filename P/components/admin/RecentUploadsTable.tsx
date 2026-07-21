"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Presentation,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createClient } from "@/lib/supabase/client";

export type UploadRow = {
  id: string;
  file_name: string | null;
  file_url: string | null;
  subject_id: string | null;
  subject?: { name: string } | null;
  ai_analyzed: boolean | null;
  created_at: string | null;
};

function storageObjectPath(fileUrl: string | null): string | null {
  if (!fileUrl?.startsWith("course-materials/")) return null;
  return fileUrl.slice("course-materials/".length);
}

function fileIcon(name: string | null) {
  const n = name?.toLowerCase() ?? "";
  if (n.endsWith(".pptx") || n.endsWith(".ppt"))
    return { Icon: Presentation, color: "text-blue-500" };
  if (n.endsWith(".pdf"))
    return { Icon: FileText, color: "text-red-500" };
  return { Icon: FileText, color: "text-gray-500" };
}

function statusBadge(analyzed: boolean | null) {
  if (analyzed)
    return { label: "Completed", className: "bg-[#1D9E75]/15 text-[#1D9E75]" };
  return { label: "Pending", className: "bg-gray-100 text-gray-500" };
}

type SubjectOpt = { id: string; name: string; year?: number; semester?: number };

export function RecentUploadsTable({
  rows,
  subjects = [],
}: {
  rows: UploadRow[];
  subjects?: SubjectOpt[];
}) {
  const router = useRouter();
  const supabase = createClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSubjectId, setEditSubjectId] = useState<string>("");
  const [editAi, setEditAi] = useState(false);
  const [busy, setBusy] = useState(false);

  function startEdit(r: UploadRow) {
    setEditingId(r.id);
    setEditName(r.file_name ?? "");
    setEditSubjectId(r.subject_id ?? "");
    setEditAi(!!r.ai_analyzed);
  }

  function cancelEdit() {
    setEditingId(null);
  }

  async function saveEdit(id: string) {
    setBusy(true);
    try {
      const { error } = await supabase
        .from("uploaded_notes")
        .update({
          file_name: editName.trim() || null,
          subject_id: editSubjectId || null,
          ai_analyzed: editAi,
        })
        .eq("id", id);
      if (error) throw error;
      setEditingId(null);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Update failed");
    } finally {
      setBusy(false);
    }
  }

  async function removeRow(r: UploadRow) {
    const ok = window.confirm(
      `Delete “${r.file_name ?? "this upload"}”? This cannot be undone.`
    );
    if (!ok) return;
    setBusy(true);
    try {
      const path = storageObjectPath(r.file_url);
      if (path) {
        await supabase.storage.from("course-materials").remove([path]);
      }
      const { error } = await supabase.from("uploaded_notes").delete().eq("id", r.id);
      if (error) throw error;
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="rounded-2xl border bg-white p-0 shadow-soft dark:border-white/10 dark:bg-[#2d2d44]">
      <div className="flex items-center justify-between border-b px-6 py-4">
        <h3 className="text-sm font-bold uppercase tracking-wide text-heading">
          Recent Uploads
        </h3>
        <a href="/admin/upload" className="text-sm font-semibold text-[#534AB7]">
          View All
        </a>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>File Name</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>AI Analysis</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="w-[72px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((r) => {
            if (editingId === r.id) {
              return (
                <TableRow key={`${r.id}-edit`}>
                  <TableCell colSpan={5}>
                    <div className="flex flex-col gap-4 rounded-xl border border-[#534AB7]/30 bg-[#F8F7FF]/80 p-4 dark:bg-[#1a1a2e]/80">
                      <div className="grid gap-3 sm:grid-cols-2">
                        <div className="space-y-1.5">
                          <Label htmlFor={`fn-${r.id}`}>File name</Label>
                          <Input
                            id={`fn-${r.id}`}
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            disabled={busy}
                          />
                        </div>
                        <div className="space-y-1.5">
                          <Label>Subject</Label>
                          <Select
                            value={editSubjectId || "__none__"}
                            onValueChange={(v) =>
                              setEditSubjectId(v === "__none__" ? "" : v)
                            }
                            disabled={busy}
                          >
                            <SelectTrigger>
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
                      </div>
                      <div className="flex items-center gap-3">
                        <Switch
                          id={`ai-${r.id}`}
                          checked={editAi}
                          onCheckedChange={setEditAi}
                          disabled={busy}
                        />
                        <Label htmlFor={`ai-${r.id}`} className="text-sm font-normal">
                            Mark AI analysis completed
                        </Label>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          className="rounded-lg"
                          disabled={busy}
                          onClick={() => void saveEdit(r.id)}
                        >
                          Save changes
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="rounded-lg"
                          disabled={busy}
                          onClick={cancelEdit}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              );
            }

            const { Icon, color } = fileIcon(r.file_name);
            const st = statusBadge(r.ai_analyzed);
            return (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Icon className={cn("h-5 w-5 shrink-0", color)} />
                    <span className="font-medium">{r.file_name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                    {r.subject?.name ?? "—"}
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={cn(
                      "rounded-full px-2 py-1 text-xs font-semibold",
                      st.className
                    )}
                  >
                    {st.label}
                  </span>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {r.created_at
                    ? new Date(r.created_at).toLocaleDateString()
                    : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        aria-label="Upload actions"
                        disabled={busy}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => startEdit(r)}>
                        <Pencil className="mr-2 h-4 w-4" /> Edit / update
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => void removeRow(r)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
          {!rows.length ? (
            <TableRow>
              <TableCell colSpan={5} className="py-10 text-center text-sm">
                No uploads yet.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </section>
  );
}
