"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  SEARCH_KIND_LABELS,
  type SearchResult,
  type SearchVariant,
} from "@/lib/navbar-search";

type Props = {
  variant: SearchVariant;
  placeholder: string;
};

const DEBOUNCE_MS = 280;
const MIN_QUERY = 2;

export function NavbarSearch({ variant, placeholder }: Props) {
  const router = useRouter();
  const listboxId = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const navigate = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      setActiveIndex(-1);
      router.push(href);
    },
    [router]
  );

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < MIN_QUERY) {
      setResults([]);
      setLoading(false);
      setActiveIndex(-1);
      return;
    }

    setLoading(true);
    const timer = window.setTimeout(() => {
      const params = new URLSearchParams({
        q: trimmed,
        variant,
      });
      fetch(`/api/search?${params}`)
        .then((res) => (res.ok ? res.json() : { results: [] }))
        .then((data: { results?: SearchResult[] }) => {
          setResults(data.results ?? []);
          setActiveIndex(-1);
        })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, DEBOUNCE_MS);

    return () => window.clearTimeout(timer);
  }, [query, variant]);

  useEffect(() => {
    function onPointerDown(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const showPanel =
    open && query.trim().length >= MIN_QUERY && (loading || results.length > 0);

  const grouped = results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    const label = SEARCH_KIND_LABELS[r.kind];
    if (!acc[label]) acc[label] = [];
    acc[label].push(r);
    return acc;
  }, {});

  return (
    <div ref={rootRef} className="relative mx-auto w-full max-w-xl flex-1">
      <Search className="absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        role="combobox"
        aria-expanded={showPanel}
        aria-controls={showPanel ? listboxId : undefined}
        aria-autocomplete="list"
        placeholder={placeholder}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setActiveIndex(-1);
            return;
          }
          if (!results.length) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % results.length);
            setOpen(true);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? results.length - 1 : i - 1));
            setOpen(true);
          } else if (e.key === "Enter" && activeIndex >= 0) {
            e.preventDefault();
            navigate(results[activeIndex].href);
          }
        }}
        className="h-11 rounded-full border-none bg-muted/60 pl-10 shadow-inner"
      />

      {showPanel ? (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-50 max-h-[min(70vh,22rem)] overflow-y-auto rounded-2xl border bg-card py-2 shadow-lg ring-1 ring-black/5 dark:ring-white/10"
        >
          {loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">Searching…</p>
          ) : null}

          {!loading && results.length === 0 ? (
            <p className="px-4 py-3 text-sm text-muted-foreground">
              No results for &ldquo;{query.trim()}&rdquo;
            </p>
          ) : null}

          {Object.entries(grouped).map(([label, items]) => (
            <div key={label} className="px-2 py-1">
              <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <ul className="space-y-0.5">
                {items.map((item) => {
                  const flatIndex = results.indexOf(item);
                  const active = flatIndex === activeIndex;
                  return (
                    <li key={item.id} role="option" aria-selected={active}>
                      <button
                        type="button"
                        className={cn(
                          "flex w-full flex-col rounded-xl px-3 py-2 text-left text-sm transition-colors",
                          active
                            ? "bg-[#534AB7]/10 text-[#534AB7]"
                            : "hover:bg-muted/80"
                        )}
                        onMouseEnter={() => setActiveIndex(flatIndex)}
                        onClick={() => navigate(item.href)}
                      >
                        <span className="font-semibold text-heading">
                          {item.title}
                        </span>
                        {item.subtitle ? (
                          <span className="text-xs text-muted-foreground">
                            {item.subtitle}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
