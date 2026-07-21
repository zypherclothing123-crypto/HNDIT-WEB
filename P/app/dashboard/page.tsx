import { createClient } from "@/lib/supabase/server";
import { HeroBanner } from "@/components/dashboard/HeroBanner";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { DashboardLabsSection } from "@/components/dashboard/DashboardLabsSection";
import type { DashboardIconName } from "@/components/dashboard/dashboard-icons";
import { AchievementBadge } from "@/components/dashboard/AchievementBadge";
import { TopStudentsList } from "@/components/dashboard/TopStudentsList";
import type { TopStudent } from "@/components/dashboard/TopStudentsList";
import { profileAvatarPublicUrl } from "@/lib/supabase/profile-avatar-public-url";
import { redirect } from "next/navigation";
import {
  fetchLeaderboardEntries,
  rankForUser,
  levelFromXp,
} from "@/lib/leaderboard-stats";

async function loadStats(userId: string) {
  const supabase = await createClient();
  const { data: progress } = await supabase
    .from("user_progress")
    .select("score, completed")
    .eq("user_id", userId);

  const totalXp =
    progress?.reduce((acc, p) => acc + (p.score ?? 0), 0) ?? 0;
  const quizzes = progress?.filter((p) => p.completed).length ?? 0;

  const { count: achCount } = await supabase
    .from("achievements")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId);

  const entries = await fetchLeaderboardEntries(supabase);
  const rank = rankForUser(entries, userId);
  const levelInfo = levelFromXp(totalXp);

  const topStudents: TopStudent[] = entries.slice(0, 3).map((e, i) => ({
    userId: e.userId,
    rank: i + 1,
    name: e.displayName,
    xp: e.totalXp,
    avatarUrl: e.avatarUrl,
    isYou: e.userId === userId,
  }));

  const inTop3 = entries.slice(0, 3).some((e) => e.userId === userId);
  if (!inTop3) {
    const me = entries.find((e) => e.userId === userId);
    if (me) {
      topStudents.push({
        userId: me.userId,
        rank,
        name: me.displayName,
        xp: me.totalXp,
        avatarUrl: me.avatarUrl,
        isYou: true,
      });
    }
  }

  return {
    totalXp,
    quizzes,
    achievements: achCount ?? 0,
    rank,
    topStudents,
    levelInfo,
  };
}

const DASHBOARD_SUBJECT_ICON_CYCLE: DashboardIconName[] = [
  "code",
  "database",
  "network",
];

function buildDashboardSubjectLabs(
  subjects: {
    id: string;
    name: string;
    year: number;
    semester: number;
    code: string | null;
  }[],
  labs: {
    id: string;
    title: string;
    subject_id: string;
    difficulty: string | null;
    order_index: number | null;
  }[],
  progress: { lab_id: string; completed: boolean | null; score: number | null }[]
) {
  const progressByLab = new Map(
    progress.map((p) => [p.lab_id as string, p] as const)
  );
  const labsBySubject = new Map<string, typeof labs>();
  for (const lab of labs) {
    const sid = lab.subject_id as string;
    if (!labsBySubject.has(sid)) labsBySubject.set(sid, []);
    labsBySubject.get(sid)!.push(lab);
  }

  return subjects.map((s, i) => {
    const slabs = labsBySubject.get(s.id) ?? [];
    slabs.sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
    
    const labRows = slabs.map((lab) => {
      const pr = progressByLab.get(lab.id as string);
      const completed = Boolean(pr?.completed);
      return {
        id: lab.id as string,
        title: lab.title,
        difficulty: lab.difficulty,
        completed,
        score: completed ? pr?.score ?? null : null,
      };
    });
    const done = labRows.filter((l) => l.completed).length;
    const progressPct =
      labRows.length === 0 ? 0 : Math.round((done / labRows.length) * 100);
    return {
      id: s.id,
      name: s.name,
      year: s.year,
      semester: s.semester,
      code: s.code,
      progressPct,
      labs: labRows,
      icon: DASHBOARD_SUBJECT_ICON_CYCLE[i % DASHBOARD_SUBJECT_ICON_CYCLE.length]!,
    };
  });
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");
  const userId = user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const displayName =
    profile?.full_name?.trim() ||
    user.email?.split("@")[0] ||
    "Learner";

  const heroAvatarUrl = profileAvatarPublicUrl(
    supabase,
    profile?.avatar_url ?? null
  );

  const stats = await loadStats(user.id);

  const [allSubjectsData, labProgressData] = await Promise.all([
    supabase
      .from("subjects")
      .select("id, name, year, semester, code")
      .order("year")
      .order("semester"),
    supabase
      .from("user_progress")
      .select("lab_id, completed, score")
      .eq("user_id", user.id),
  ]);

  const allSubjects = allSubjectsData.data ?? [];
  const labProgress = labProgressData.data ?? [];

  const subjectList = allSubjects;
  const dashboardSubjects = subjectList.slice(0, 8);
  const dashboardSubjectIds = dashboardSubjects.map((s) => s.id);

  const { data: subjectLabs } = dashboardSubjectIds.length
    ? await supabase
        .from("labs")
        .select("id, title, subject_id, difficulty, order_index")
        .in("subject_id", dashboardSubjectIds)
    : { data: [] as never[] };

  const labsSectionData = buildDashboardSubjectLabs(
    dashboardSubjects,
    subjectLabs ?? [],
    labProgress ?? []
  );

  const questProgress = Math.min(stats.quizzes, 5);
  const questTotal = 5;

  const { data: recentAch } = await supabase
    .from("achievements")
    .select("title, description, badge_icon")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(3);

  const badgeTone = (i: number): "gold" | "blue" | "green" => {
    const tones: ("gold" | "blue" | "green")[] = ["gold", "blue", "green"];
    return tones[i % 3];
  };

  return (
    <div className="mx-auto max-w-7xl space-y-10">
      <HeroBanner
        name={displayName}
        avatarPublicUrl={heroAvatarUrl}
        level={stats.levelInfo.level}
        currentXp={stats.levelInfo.currentXp}
        nextLevelXp={stats.levelInfo.nextLevelXp}
        questTitle="Lab quiz streak"
        questProgress={questProgress}
        questTotal={questTotal}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          icon="medal"
          label="Total XP"
          value={stats.totalXp.toLocaleString()}
          delay={0}
        />
        <StatsCard
          icon="bookOpen"
          label="Labs completed"
          value={stats.quizzes}
          delay={0.05}
        />
        <StatsCard
          icon="trophy"
          label="Achievements"
          value={stats.achievements}
          delay={0.1}
        />
        <StatsCard
          icon="barChart3"
          label="Global Rank"
          value={`#${stats.rank}`}
          hint="Based on quiz XP"
          highlight
          delay={0.15}
        />
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_320px]">
        <DashboardLabsSection
          subjects={labsSectionData}
          totalSubjectCount={subjectList.length}
        />

        <TopStudentsList students={stats.topStudents} />
      </div>

      <section>
        <h2 className="mb-4 text-xl font-bold text-heading">
          Recent Achievements
        </h2>
        {recentAch?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentAch.map((a, i) => (
              <AchievementBadge
                key={`${a.title}-${i}`}
                title={a.title}
                description={a.description ?? ""}
                icon={a.badge_icon as any || "medal"}
                tone={badgeTone(i)}
              />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Finish a lab quiz to earn your first badges — they will show up
            here.
          </p>
        )}
      </section>
    </div>
  );
}
