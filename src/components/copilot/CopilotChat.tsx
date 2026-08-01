"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Send, Sparkles, User } from "lucide-react";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils/helpers";

interface Msg {
  role: "user" | "assistant";
  content: string;
  refs?: string[];
}

const SUGGESTIONS = [
  "What is the current governance risk profile?",
  "Summarize the latest tokenomics knowledge",
  "Which knowledge items are volatile right now?",
  "Are there unresolved conflicts around security?",
];

const TEMPLATES = [
  (ids: string[]) =>
    `Based on ${ids.join(", ")}, the current assessment is that governance structures remain the dominant risk surface. Evidence weights favor the foundation-controlled treasury narrative, but conflict ledger C-00${(Number(ids[0]?.replace(/\D/g, "") ?? 1) % 10) + 1} shows unresolved tension. I recommend monitoring delegate concentration next.`,
  (ids: string[]) =>
    `Analyzed against CIF evidence traces: ${ids.join(", ")} all carry stable-to-high confidence. The strongest signal is treasury control — cross-checked across foundation disclosures and on-chain votes. No contradictory evidence found in the last 30 days.`,
  (ids: string[]) =>
    `Here is the distilled view: ${ids.join(", ")} indicate a protocol that prioritizes execution speed over decentralization trade-offs. The volatile items suggest market-sensitive narratives (TVL, incentives) that should be re-verified on a weekly cadence.`,
  (ids: string[]) =>
    `Cross-referencing ${ids.join(", ")} with the conflict center: two conflicts remain unresolved in related phases. Recommend opening a review ticket before the next governance cycle.`,
];

export function CopilotChat({
  slug,
  projectName,
  knowledge,
}: {
  slug: string;
  projectName: string;
  knowledge: KnowledgeItem[];
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `I am the CIF Copilot for ${projectName}. I can reason across the knowledge ledger, evidence traces and conflict center. Ask me anything — or pick a suggestion below.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const tick = useRef(0);

  const refs = useMemo(() => {
    const stable = knowledge.filter((k) => k.status === "Stable").slice(0, 4);
    return stable.length >= 2 ? stable : knowledge.slice(0, 4);
  }, [knowledge]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, typing]);

  const send = (raw?: string) => {
    const text = (raw ?? input).trim();
    if (!text || typing) return;
    setInput("");
    setMessages((m) => [...m, { role: "user", content: text }]);
    setTyping(true);

    const t = tick.current++;
    const replyIds = refs.slice(t % Math.max(refs.length - 1, 1), t % Math.max(refs.length - 1, 1) + 2).map((k) => k.id);
    const template = TEMPLATES[t % TEMPLATES.length];
    const delay = 900 + (t % 3) * 350;

    setTimeout(() => {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: template(replyIds), refs: replyIds },
      ]);
      setTyping(false);
    }, delay);
  };

  return (
    <div className="flex h-[calc(100vh-260px)] min-h-[480px] flex-col overflow-hidden rounded-lg border border-border bg-card">
      {/* header */}
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-4 py-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/15 text-primary">
          <Bot className="h-4 w-4" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-foreground">CIF Copilot</div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-dot" />
            Grounded on {knowledge.length} knowledge items · UI demo
          </div>
        </div>
        <Badge variant="muted" className="ml-auto">
          <Sparkles className="h-3 w-3" /> CIF v1.0
        </Badge>
      </div>

      {/* messages */}
      <ScrollArea className="flex-1" ref={scrollRef}>
        <div className="flex flex-col gap-3 p-4">
          {messages.map((m, i) => (
            <div
              key={i}
              className={cn(
                "flex gap-2.5",
                m.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              <div
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  m.role === "user"
                    ? "bg-primary/20 text-primary"
                    : "bg-success/15 text-success"
                )}
              >
                {m.role === "user" ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </div>
              <div
                className={cn(
                  "max-w-[78%] rounded-lg border px-3.5 py-2.5",
                  m.role === "user"
                    ? "border-primary/40 bg-primary/10"
                    : "border-border bg-muted/40"
                )}
              >
                <p className="text-[13px] leading-relaxed text-foreground/95">
                  {m.content}
                </p>
                {m.refs && m.refs.length > 0 && (
                  <div className="mt-2.5 space-y-1.5 border-t border-border/60 pt-2.5">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                      Citations
                    </span>
                    <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                      {m.refs.map((r) => {
                        const item = knowledge.find((k) => k.id === r);
                        if (!item) return null;
                        return (
                          <Link
                            key={r}
                            href={`/project/${slug}/knowledge/${r}`}
                            className="group rounded-md border border-border/80 bg-card p-2 transition-all hover:border-primary/60 hover:shadow-md hover:shadow-primary/10"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] text-muted-foreground">{item.id}</span>
                              <Badge
                                variant={
                                  item.status === "Stable"
                                    ? "success"
                                    : item.status === "Volatile"
                                      ? "warning"
                                      : item.status === "Deprecated"
                                        ? "muted"
                                        : "default"
                                }
                                className="ml-auto px-1.5 py-0 text-[8.5px]"
                              >
                                {item.status}
                              </Badge>
                            </div>
                            <div className="mt-1 line-clamp-1 text-[11px] font-medium text-foreground/90 group-hover:text-primary">
                              {item.name}
                            </div>
                            <div className="mt-0.5 font-mono text-[9.5px] text-muted-foreground">
                              {item.confidence}% · {item.evidence.length} ev
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Bot className="h-3.5 w-3.5" />
              </div>
              <div className="flex gap-1 rounded-lg border border-border bg-muted/40 px-3.5 py-3">
                {[0, 1, 2].map((d) => (
                  <span
                    key={d}
                    className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground"
                    style={{ animationDelay: `${d * 150}ms` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* suggestions */}
      <div className="flex flex-wrap gap-1.5 border-t border-border px-4 pt-2.5">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => send(s)}
            disabled={typing}
            className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-[11px] text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      {/* input */}
      <form
        className="flex items-center gap-2 p-3"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask about ${projectName}…`}
          className="h-10 bg-muted/30"
        />
        <Button type="submit" size="icon" className="h-10 w-10" disabled={!input.trim() || typing}>
          <Send className="h-4 w-4" />
        </Button>
      </form>
    </div>
  );
}
