import { CpuSchedulingLab } from "@/components/labs/CpuSchedulingLab";
import { BattleArenaNotificationPing } from "@/components/notifications/BattleArenaNotificationPing";

export default async function CpuSchedulingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const opponentId = typeof params.opponent === "string" ? params.opponent : undefined;

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <BattleArenaNotificationPing />
      <div>
        <h1 className="text-2xl font-bold text-heading">CPU Scheduling Lab</h1>
        <p className="text-sm text-muted-foreground">
          Three-panel layout: theory, GSAP Gantt animation, mastery progress.
        </p>
      </div>
      <CpuSchedulingLab opponentId={opponentId} />
    </div>
  );
}
