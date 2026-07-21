"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "@/components/ai-tutor/ChatMessage";
import { TypingIndicator } from "@/components/ai-tutor/TypingIndicator";
import {
  ModeSelector,
  modeSuggestions,
  type TutorMode,
} from "@/components/ai-tutor/ModeSelector";
const authedFetch = fetch;

type Msg = { role: "user" | "assistant"; content: string };

type Props = {
  userAvatarUrl: string | null;
  userInitials: string;
};

export function AiTutorClient({ userAvatarUrl, userInitials }: Props) {
  const [mode, setMode] = useState<TutorMode>("general");
  const [language, setLanguage] = useState<"en" | "si">("en");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([]);
  const sessionRef = useRef<number | null>(null);
  const [busy, setBusy] = useState(false);

  async function persist(next: Msg[]) {
    if (!sessionRef.current) {
      const res = await fetch("/api/ai-tutor/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_title: next[0]?.content?.slice(0, 40) ?? "New Chat",
          mode,
          language,
          messages: next,
        }),
      });
      const json = await res.json();
      if (json.session?.id) sessionRef.current = json.session.id;
    } else {
      await authedFetch("/api/ai-tutor/sessions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: sessionRef.current,
          messages: next,
          mode,
          language,
        }),
      });
    }
  }

  async function send(text?: string) {
    const body = (text ?? input).trim();
    if (!body || busy) return;
    setBusy(true);
    const userMsg: Msg = { role: "user", content: body };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    await persist(next);

    const res = await authedFetch("/api/ai-tutor", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: [...next],
        mode,
        language,
      }),
    });
    const json = await res.json();
    const reply =
      typeof json.reply === "string" ? json.reply : "Sorry, something went wrong.";
    const assistant: Msg = { role: "assistant", content: reply };
    const full = [...next, assistant];
    setMessages(full);
    await persist(full);
    setBusy(false);
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-4 pb-24">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-heading">AI Study Assistant</h1>
          <p className="text-sm text-muted-foreground">
            Powered by Gemini — tuned for HNDIT labs and exams.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          className="rounded-full border-[#534AB7] text-[#534AB7]"
          onClick={() =>
            setLanguage((l) => (l === "en" ? "si" : "en"))
          }
        >
          {language === "en" ? "සිංහල" : "English"}
        </Button>
      </div>

      <div className="rounded-2xl border bg-card p-4 shadow-soft">
        <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">
          Mode
        </p>
        <ModeSelector value={mode} onChange={setMode} />
        <div className="mt-3 flex flex-wrap gap-2">
          {modeSuggestions(mode).map((s) => (
            <button
              key={s}
              type="button"
              className="rounded-full bg-muted px-3 py-1 text-xs font-medium text-heading hover:bg-muted/80"
              onClick={() => send(s)}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="flex min-h-[420px] flex-col gap-3 rounded-2xl border bg-card/80 p-4 shadow-inner">
        {messages.length === 0 ? (
          <p className="m-auto text-center text-sm text-muted-foreground">
            Ask anything to start a session. Your history saves automatically.
          </p>
        ) : null}
        {messages.map((m, i) => (
          <ChatMessage
            key={`${i}-${m.role}`}
            role={m.role}
            content={m.content}
            userAvatarUrl={m.role === "user" ? userAvatarUrl : null}
            userInitials={userInitials}
          />
        ))}
        {busy ? <TypingIndicator /> : null}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-background/90 p-4 backdrop-blur md:left-64">
        <div className="mx-auto flex max-w-4xl gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your question..."
            className="rounded-2xl"
            onKeyDown={(e) => {
              if (e.key === "Enter") void send();
            }}
          />
          <Button
            className="rounded-2xl px-6"
            type="button"
            disabled={busy}
            onClick={() => void send()}
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
