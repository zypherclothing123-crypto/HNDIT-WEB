"use client";

import { useEffect, useMemo, useState } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-css";
import "prismjs/components/prism-markup";
import "prismjs/themes/prism-tomorrow.css";

type Example = { language: string; code: string; explanation?: string };

function highlight(code: string, language: string) {
  const lang = language.toLowerCase();
  const grammar =
    Prism.languages[lang] ??
    Prism.languages.javascript ??
    Prism.languages.markup;
  if (!grammar) return code;
  return Prism.highlight(code, grammar, lang);
}

export function CodeSimulation({ examples }: { examples: Example[] }) {
  const [idx, setIdx] = useState(0);
  const ex = examples[idx] ?? examples[0];

  const htmlSnippet = useMemo(() => {
    const lower = ex?.language?.toLowerCase() ?? "";
    if (lower.includes("html")) return ex?.code ?? "";
    return "";
  }, [ex]);

  useEffect(() => {
    if (!ex) return;
    Prism.highlightAll();
  }, [ex, idx]);

  if (!ex) {
    return (
      <p className="text-sm text-muted-foreground">
        No interactive snippets yet — check back after the next AI generation run.
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {examples.map((e, i) => (
            <button
              key={`${e.language}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                i === idx
                  ? "bg-[#005581] text-white"
                  : "bg-muted text-heading"
              }`}
            >
              {e.language}
            </button>
          ))}
        </div>
        {ex.explanation ? (
          <p className="text-sm text-muted-foreground">{ex.explanation}</p>
        ) : null}
        <pre className="max-h-[420px] overflow-auto rounded-2xl bg-[#05131e] p-4 text-xs text-white">
          <code
            className={`language-${ex.language.toLowerCase()}`}
            dangerouslySetInnerHTML={{ __html: highlight(ex.code, ex.language) }}
          />
        </pre>
      </div>
      <div className="space-y-2">
        <p className="text-sm font-semibold text-heading">Live preview</p>
        <div className="min-h-[280px] overflow-hidden rounded-2xl border bg-white shadow-inner dark:bg-[#111]">
          {htmlSnippet ? (
            <iframe
              title="preview"
              sandbox="allow-scripts"
              className="h-[360px] w-full bg-white"
              srcDoc={htmlSnippet}
            />
          ) : (
            <div className="flex h-[280px] items-center justify-center p-4 text-center text-sm text-muted-foreground">
              Preview appears when an HTML snippet is provided. For JS/CSS, study
              the highlighted block and run locally in your IDE.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
