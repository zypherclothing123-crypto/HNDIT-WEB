import type { SupabaseClient } from "@supabase/supabase-js";

export type SearchVariant = "user" | "admin";

export type SearchResultKind =
  | "page"
  | "subject"
  | "lab"
  | "note"
  | "student";

export type SearchResult = {
  id: string;
  kind: SearchResultKind;
  title: string;
  subtitle?: string;
  href: string;
};

const USER_PAGES: SearchResult[] = [
  { id: "page-dashboard", kind: "page", title: "Dashboard", href: "/dashboard" },
  {
    id: "page-labs",
    kind: "page",
    title: "Subjects & labs",
    subtitle: "Browse curriculum",
    href: "/labs",
  },
  { id: "page-ai-tutor", kind: "page", title: "AI Tutor", href: "/ai-tutor" },
  { id: "page-quiz", kind: "page", title: "Quizzes", href: "/quiz/demo" },
  {
    id: "page-leaderboard",
    kind: "page",
    title: "Leaderboard",
    href: "/leaderboard",
  },
  {
    id: "page-achievements",
    kind: "page",
    title: "Achievements",
    href: "/achievements",
  },
  { id: "page-profile", kind: "page", title: "Profile", href: "/profile" },
  {
    id: "page-cpu",
    kind: "page",
    title: "CPU scheduling simulation",
    subtitle: "Battles",
    href: "/labs/simulation/cpu-scheduling",
  },
];

const ADMIN_PAGES: SearchResult[] = [
  {
    id: "page-admin-dashboard",
    kind: "page",
    title: "Overview",
    subtitle: "Admin dashboard",
    href: "/admin/dashboard",
  },
  {
    id: "page-admin-analytics",
    kind: "page",
    title: "Analytics",
    href: "/admin/analytics",
  },
  {
    id: "page-admin-subjects",
    kind: "page",
    title: "Subjects",
    href: "/admin/subjects",
  },
  {
    id: "page-admin-upload",
    kind: "page",
    title: "Content upload",
    href: "/admin/upload",
  },
  {
    id: "page-admin-users",
    kind: "page",
    title: "Students",
    href: "/admin/users",
  },
  {
    id: "page-admin-labs",
    kind: "page",
    title: "Labs",
    href: "/admin/labs",
  },
  {
    id: "page-admin-settings",
    kind: "page",
    title: "Settings",
    href: "/admin/settings",
  },
  {
    id: "page-admin-profile",
    kind: "page",
    title: "My profile",
    href: "/profile",
  },
];

export function escapeIlike(raw: string): string {
  return raw.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

function matchesStatic(text: string, q: string): boolean {
  return text.toLowerCase().includes(q.toLowerCase());
}

export function filterStaticPages(
  variant: SearchVariant,
  q: string
): SearchResult[] {
  const pages = variant === "admin" ? ADMIN_PAGES : USER_PAGES;
  return pages.filter(
    (p) =>
      matchesStatic(p.title, q) ||
      (p.subtitle ? matchesStatic(p.subtitle, q) : false)
  );
}

export async function runNavbarSearch(
  supabase: SupabaseClient,
  variant: SearchVariant,
  q: string
): Promise<SearchResult[]> {
  const trimmed = q.trim();
  if (trimmed.length < 2) return [];

  const pattern = `%${escapeIlike(trimmed)}%`;
  const results: SearchResult[] = filterStaticPages(variant, trimmed);

  const { data: subjects } = await supabase
    .from("subjects")
    .select("id, name, code, year, semester")
    .or(`name.ilike.${pattern},code.ilike.${pattern},description.ilike.${pattern}`)
    .order("name")
    .limit(6);

  for (const s of subjects ?? []) {
    const meta = `Year ${s.year} · Sem ${s.semester}`;
    results.push({
      id: `subject-${s.id}`,
      kind: "subject",
      title: s.name,
      subtitle: s.code ? `${s.code} · ${meta}` : meta,
      href:
        variant === "admin" ? "/admin/subjects" : `/labs/${s.id}`,
    });
  }

  const { data: labs } = await supabase
    .from("labs")
    .select("id, title, subject_id, difficulty")
    .or(`title.ilike.${pattern},description.ilike.${pattern}`)
    .order("title")
    .limit(8);

  for (const lab of labs ?? []) {
    const subjectId = lab.subject_id as string | null;
    const href =
      variant === "admin"
        ? "/admin/labs"
        : subjectId
          ? `/labs/${subjectId}/${lab.id}`
          : "/labs";
    results.push({
      id: `lab-${lab.id}`,
      kind: "lab",
      title: lab.title,
      subtitle: lab.difficulty ?? undefined,
      href,
    });
  }

  if (variant === "admin") {
    const { data: notes } = await supabase
      .from("uploaded_notes")
      .select("id, file_name")
      .ilike("file_name", pattern)
      .order("created_at", { ascending: false })
      .limit(5);

    for (const note of notes ?? []) {
      if (!note.file_name) continue;
      results.push({
        id: `note-${note.id}`,
        kind: "note",
        title: note.file_name,
        subtitle: "Uploaded material",
        href: "/admin/upload",
      });
    }

    const { data: students } = await supabase
      .from("profiles")
      .select("id, full_name, email, student_id, role")
      .neq("role", "admin")
      .or(
        `full_name.ilike.${pattern},email.ilike.${pattern},student_id.ilike.${pattern}`
      )
      .order("full_name")
      .limit(5);

    for (const st of students ?? []) {
      const title = st.full_name?.trim() || st.email || "Student";
      results.push({
        id: `student-${st.id}`,
        kind: "student",
        title,
        subtitle: st.email ?? st.student_id ?? undefined,
        href: "/admin/users",
      });
    }
  }

  const seen = new Set<string>();
  return results.filter((r) => {
    if (seen.has(r.id)) return false;
    seen.add(r.id);
    return true;
  });
}

export const SEARCH_KIND_LABELS: Record<SearchResultKind, string> = {
  page: "Pages",
  subject: "Subjects",
  lab: "Labs",
  note: "Materials",
  student: "Students",
};
