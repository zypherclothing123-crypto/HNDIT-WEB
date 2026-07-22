"use client";

import { useEffect, useMemo } from "react";
import Prism from "prismjs";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-python";
import "prismjs/themes/prism-tomorrow.css";
import { Bot } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

function extractCodeBlocks(md: string) {
  const parts: { type: "text" | "code"; lang?: string; value: string }[] = [];
  const re = /```(\w+)?\s*([\s\S]*?)```/g;
  let last = 0;
  let m: RegExpExecArray | null;
  while ((m = re.exec(md)) !== null) {
    if (m.index > last) {
      parts.push({ type: "text", value: md.slice(last, m.index) });
    }
    parts.push({ type: "code", lang: m[1] ?? "text", value: m[2].trim() });
    last = m.index + m[0].length;
  }
  if (last < md.length) parts.push({ type: "text", value: md.slice(last) });
  if (parts.length === 0) parts.push({ type: "text", value: md });
  return parts;
}

export function ChatMessage({
  role,
  content,
  userAvatarUrl,
  userInitials = "?",
}: {
  role: "user" | "assistant";
  content: string;
  userAvatarUrl?: string | null;
  /** Two-letter fallback when `userAvatarUrl` is empty (user messages only). */
  userInitials?: string;
}) {
  const segments = useMemo(() => extractCodeBlocks(content), [content]);

  useEffect(() => {
    Prism.highlightAll();
  }, [segments, content]);

  const align =
    role === "user" ? "items-end text-right" : "items-start text-left";
  const bubble =
    role === "user"
      ? "bg-[#005581] text-white rounded-2xl rounded-br-sm shadow-md"
      : "bg-white border-2 border-slate-100 text-slate-800 rounded-2xl rounded-bl-sm shadow-sm dark:bg-[#0a1f2e] dark:border-white/5 dark:text-slate-200";

  const initials = userInitials.slice(0, 2).toUpperCase() || "?";

  return (
    <div className={`flex w-full flex-col ${align}`}>
      <div
        className={`flex max-w-[85%] items-end gap-3 ${
          role === "user" ? "flex-row-reverse" : "flex-row"
        }`}
      >
        {role === "user" ? (
          <Avatar
            className="h-8 w-8 shrink-0 border border-white/20"
            aria-label="You"
          >
            {userAvatarUrl ? (
              <AvatarImage
                src={userAvatarUrl}
                alt=""
                className="object-cover"
              />
            ) : null}
            <AvatarFallback className="bg-[#005581] text-[10px] font-bold text-[#ffd200]">
              {initials}
            </AvatarFallback>
          </Avatar>
        ) : (
          <Avatar
            className="h-8 w-8 shrink-0 border border-muted"
            aria-label="AI assistant"
          >
            <AvatarFallback className="bg-[#72CDF4]/20 text-[#005581] dark:bg-[#72CDF4]/10 dark:text-[#72CDF4]">
              <Bot className="h-5 w-5" aria-hidden />
            </AvatarFallback>
          </Avatar>
        )}
        <div className={`px-4 py-3 shadow-sm ${bubble}`}>
          {segments.map((s, i) =>
            s.type === "code" ? (
              <pre
                key={i}
                className="my-2 max-w-full overflow-x-auto rounded-xl bg-[#05131e] p-3 text-left text-xs"
              >
                <code className={`language-${s.lang ?? "javascript"}`}>
                  {s.value}
                </code>
              </pre>
            ) : (
              <p key={i} className="whitespace-pre-wrap text-sm leading-relaxed">
                {s.value}
              </p>
            )
          )}
        </div>
      </div>
    </div>
  );
}
