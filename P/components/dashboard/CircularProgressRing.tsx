"use client";

type Props = {
  value: number;
  size?: number;
  stroke?: number;
  label: string;
  sublabel?: string;
};

/** SVG circular ring for level / XP (dashboard hero). */
export function CircularProgressRing({
  value,
  size = 120,
  stroke = 8,
  label,
  sublabel,
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;

  return (
    <div
      className="relative flex flex-col items-center justify-center text-white"
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={stroke}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="white"
          strokeWidth={stroke}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-lg font-bold leading-none">{label}</span>
        {sublabel ? (
          <span className="mt-1 text-[10px] font-medium text-white/80">
            {sublabel}
          </span>
        ) : null}
      </div>
    </div>
  );
}
