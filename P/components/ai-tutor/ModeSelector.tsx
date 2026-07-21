"use client";

const modes = [
  { id: "general", label: "General" },
  { id: "concept_explain", label: "Concept Explain" },
  { id: "code_debug", label: "Code Debug" },
  { id: "past_papers", label: "Past Papers" },
  { id: "lab_practical", label: "Lab Practical" },
] as const;

export type TutorMode = (typeof modes)[number]["id"];

export function ModeSelector({
  value,
  onChange,
}: {
  value: TutorMode;
  onChange: (m: TutorMode) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {modes.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onChange(m.id)}
          className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
            value === m.id
              ? "bg-[#534AB7] text-white"
              : "bg-muted text-heading hover:bg-muted/80"
          }`}
        >
          {m.label}
        </button>
      ))}
    </div>
  );
}

export function modeSuggestions(mode: TutorMode): string[] {
  switch (mode) {
    case "concept_explain":
      return [
        "Explain Big-O for nested loops",
        "Compare stack vs queue",
        "What is normalization?",
      ];
    case "code_debug":
      return [
        "Debug my React useEffect loop",
        "Why is this SQL query slow?",
        "Fix this async/await bug",
      ];
    case "past_papers":
      return [
        "OS scheduling essay plan",
        "DBMS ER model checklist",
        "Web security long-form answer",
      ];
    case "lab_practical":
      return [
        "Lab wiring checklist",
        "Expected CLI output",
        "How to capture screenshots",
      ];
    default:
      return [
        "Summarize today's reading",
        "Give me a 10-min revision plan",
        "Mental model for pointers",
      ];
  }
}
