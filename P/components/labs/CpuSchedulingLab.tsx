"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

import { createClient } from "@/lib/supabase/client";

type Proc = { id: string; burst: number; color: string };

const initial: Proc[] = [
  { id: "P1", burst: 12, color: "#534AB7" },
  { id: "P2", burst: 4, color: "#EF9F27" },
  { id: "P3", burst: 8, color: "#1D9E75" },
];

/** Interactive FCFS demo with GSAP-animated Gantt segments (educational). */
export function CpuSchedulingLab({ opponentId }: { opponentId?: string }) {
  const supabase = createClient();
  const [queue, setQueue] = useState(initial);
  const [timeline, setTimeline] = useState<{ id: string; start: number; end: number }[]>([]);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1.5);
  const [opponentProgress, setOpponentProgress] = useState(0);
  const ganttRef = useRef<HTMLDivElement>(null);

  // Real-time Battle Logic
  useEffect(() => {
    if (!opponentId) return;

    const channel = supabase.channel(`battle:${opponentId}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on("broadcast", { event: "progress" }, ({ payload }) => {
        setOpponentProgress(payload.percent);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [opponentId, supabase]);

  const totalBurst = useMemo(
    () => queue.reduce((a, p) => a + p.burst, 0),
    [queue]
  );

  function runFcfs() {
    const seq: { id: string; start: number; end: number }[] = [];
    let t = 0;
    for (const p of queue) {
      seq.push({ id: p.id, start: t, end: t + p.burst });
      t += p.burst;
    }
    setTimeline(seq);
    setPlaying(true);

    // Broadcast my progress if in battle
    if (opponentId) {
      supabase.channel(`battle:${opponentId}`).send({
        type: "broadcast",
        event: "progress",
        payload: { percent: 100 },
      });
    }
  }

  useEffect(() => {
    if (!playing || !ganttRef.current) return;
    const bars = Array.from(ganttRef.current.querySelectorAll("[data-bar]"));
    gsap.fromTo(
      bars,
      { scaleX: 0, transformOrigin: "left center" },
      {
        scaleX: 1,
        duration: 1 / speed,
        stagger: 0.12 / speed,
        ease: "power2.out",
        onComplete: () => setPlaying(false),
      }
    );
  }, [playing, timeline, speed]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_2fr_1fr]">
      <section className="rounded-2xl border bg-card p-4 shadow-soft">
        <p className="text-xs font-bold uppercase text-[#6b7280]">Theory</p>
        <h3 className="mt-2 text-lg font-bold">CPU Scheduling</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          CPU scheduling selects which ready process runs next. FCFS executes
          strictly in arrival order — simple, but convoy effects can hurt average
          wait time.
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm">
          <li>First-Come, First-Served</li>
          <li>Round Robin</li>
          <li>Priority Scheduling</li>
        </ol>
      </section>

      <section className="space-y-3 rounded-2xl border bg-[#1a1a2e] p-4 text-white shadow-soft">
        <header className="flex flex-wrap items-center justify-between gap-2 text-xs text-white/70">
          <span>lab_simulation_v1.0.cpu</span>
          <span>System quantum: 24ms</span>
        </header>
        <div>
          <p className="text-xs font-semibold text-white/60">Ready Queue</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {queue.map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-[#2d2d44] px-3 py-2 text-xs"
                style={{ borderColor: p.color }}
              >
                <div className="font-bold">{p.id}</div>
                <label className="mt-1 flex items-center gap-1 text-[10px] text-white/70">
                  Burst
                  <input
                    type="number"
                    className="w-14 rounded-md border border-white/10 bg-black/30 px-1 text-white"
                    value={p.burst}
                    onChange={(e) => {
                      const v = Number(e.target.value);
                      setQueue((q) =>
                        q.map((x) =>
                          x.id === p.id ? { ...x, burst: v || 0 } : x
                        )
                      );
                    }}
                  />
                </label>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-white/60">Gantt</p>
          <div ref={ganttRef} className="mt-2 flex h-12 items-end gap-1">
            {timeline.map((seg, i) => {
              const proc = queue.find((p) => p.id === seg.id);
              const width = `${(seg.end - seg.start) / totalBurst * 100}%`;
              return (
                <div
                  key={`${seg.id}-${i}`}
                  data-bar
                  className="flex h-full items-end rounded-md"
                  style={{
                    width,
                    background: proc?.color ?? "#534AB7",
                  }}
                  title={`${seg.id}: ${seg.start}-${seg.end}ms`}
                />
              );
            })}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-white/50">
            <span>0ms</span>
            <span>{totalBurst}ms</span>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            className="rounded-full bg-white text-[#1a1a2e]"
            onClick={runFcfs}
          >
            ▶ Play FCFS
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="rounded-full border-white/40 text-white"
            onClick={() => setTimeline([])}
          >
            Reset
          </Button>
          <label className="ml-auto flex items-center gap-2 text-xs text-white/70">
            Speed
            <input
              type="range"
              min={0.5}
              max={3}
              step={0.1}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border bg-card p-4 shadow-soft">
        <p className="text-xs font-bold uppercase text-[#6b7280]">
          {opponentId ? "Battle Progress" : "Chapter Mastery"}
        </p>
        <div className="mt-4 flex flex-col items-center">
          {opponentId ? (
            <div className="w-full space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Your Progress</p>
                <Progress value={timeline.length > 0 ? 100 : 0} className="mt-1 h-2" />
              </div>
              <div>
                <p className="text-xs font-semibold text-muted-foreground">Opponent Progress</p>
                <Progress value={opponentProgress} className="mt-1 h-2 bg-red-100" />
              </div>
            </div>
          ) : (
            <>
              <div className="text-3xl font-bold text-[#534AB7]">72%</div>
              <Progress value={72} className="mt-3 w-full" />
            </>
          )}
        </div>
        <p className="mt-4 text-sm text-muted-foreground">
          {opponentId 
            ? "Complete the simulation faster than your opponent to win bonus XP!"
            : "You're two experiments away from mastering scheduling fundamentals."}
        </p>
        <div className="mt-4 space-y-3 text-xs">
          <div className="flex justify-between font-semibold">
            <span>Lab Activity</span>
            <span className="text-[#1D9E75]">+450 XP</span>
          </div>
          <div>
            <p className="font-semibold">Locked Achievements</p>
            <p className="text-muted-foreground">Kernel Wizard — run 50 sims</p>
          </div>
        </div>
      </section>
    </div>
  );
}
