import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarClock,
  Database,
  ExternalLink,
  Fingerprint,
  Lightbulb,
  UserRound,
} from "lucide-react";
import { projectRepository, knowledgeRepository, eventRepository } from "@/lib/api/server";
import { getProjects, getKnowledge } from "@/lib/data";
import { EvidenceTrace } from "@/components/knowledge/EvidenceTrace";
import { KnowledgeCard } from "@/components/project/KnowledgeCard";
import { ConfidenceGauge } from "@/components/knowledge/ConfidenceGauge";
import { ReadingModeShell } from "@/components/knowledge/ReadingModeShell";
import { MarkdownCopyButton } from "@/components/export/MarkdownCopyButton";
import { PrivateNote } from "@/components/notes/PrivateNote";
import { RowHistory } from "@/components/activity/RowHistory";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { buildKnowledgeMarkdown } from "@/lib/report";
import { formatDate } from "@/lib/utils/helpers";

const STATUS_VARIANT: Record<string, "success" | "default" | "warning" | "muted"> = {
  Stable: "success",
  Emerging: "default",
  Volatile: "warning",
  Deprecated: "muted",
};

/** Pre-render semua knowledge detail agar back-navigation tidak pernah 404. */
export function generateStaticParams() {
  return getProjects().flatMap((p) =>
    getKnowledge(p.slug).map((k) => ({ slug: p.slug, id: k.id }))
  );
}

export default async function KnowledgeDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const [project, item, all, events] = await Promise.all([
    projectRepository.get(slug),
    knowledgeRepository.get(slug, id),
    knowledgeRepository.list(slug),
    eventRepository.list(slug),
  ]);
  if (!project) notFound();
  if (!item) notFound();

  const related = item.relatedKnowledge
    .map((kid) => all.find((k) => k.id === kid))
    .filter((k): k is NonNullable<typeof k> => Boolean(k));
  const dependencyEvents = item.dependencies
    .map((eid) => events.find((e) => e.id === eid))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-[12px] text-muted-foreground">
        <Link href={`/project/${slug}/knowledge`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to knowledge
        </Link>
      </Button>

      {/* ============ 70/30 dossier layout ============ */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* ---------- kolom kiri: main content ---------- */}
        <ReadingModeShell>
          {/* title */}
          <header>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={STATUS_VARIANT[item.status]}>{item.status}</Badge>
              <Badge variant="secondary" className="normal-case tracking-normal">
                {item.category}
              </Badge>
              <span className="font-mono text-[11px] text-muted-foreground/60">ID: {item.id}</span>
              <MarkdownCopyButton
                content={buildKnowledgeMarkdown(item, slug)}
                label="Copy"
                variant="ghost"
                className="ml-auto h-7"
              />
            </div>
            <h1 className="mt-3 text-[26px] font-bold leading-tight tracking-tight text-foreground">
              {item.name}
            </h1>
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted-foreground">
              <span className="flex items-center gap-1">
                <UserRound className="h-3 w-3" /> {item.author}
              </span>
              <span className="flex items-center gap-1">
                <CalendarClock className="h-3 w-3" /> Updated {formatDate(item.updatedAt)}
              </span>
              <span className="flex items-center gap-1">
                <Fingerprint className="h-3 w-3" /> {item.evidence.length} evidence traces
              </span>
            </div>
          </header>

          {/* description — reading style */}
          <article className="mt-5">
            <p className="max-w-[70ch] text-[15px] leading-[1.8] text-foreground/95">
              {item.description}
            </p>
          </article>

          {/* evidence — mini timeline */}
          <section className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Evidence Trail
              </h2>
              <span className="font-mono text-[11px] text-muted-foreground/60">
                {item.evidence.length} dated &amp; weighted
              </span>
            </div>
            <div className="relative space-y-3 pl-5">
              {/* vertical line */}
              <span className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />
              {item.evidence.map((ev, i) => (
                <div key={ev.id} className="group relative">
                  <span
                    className="absolute -left-5 top-1.5 h-3 w-3 rounded-full border-2 border-background"
                    style={{
                      backgroundColor: i === 0 ? "#22d3ee" : "#64748b",
                      boxShadow: i === 0 ? "0 0 8px rgba(34,211,238,.6)" : undefined,
                    }}
                  />
                  <div className="rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/40">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <Link
                        href={`/project/${slug}/timeline?event=${ev.eventId}`}
                        className="text-[13px] font-semibold text-foreground hover:text-primary"
                      >
                        {ev.eventName}
                      </Link>
                      <span className="font-mono text-[11px] text-warning" title={`Weight ${ev.weight}/5`}>
                        {"★".repeat(ev.weight)}
                        <span className="text-muted-foreground/40">{"☆".repeat(5 - ev.weight)}</span>
                      </span>
                    </div>
                    {ev.note && (
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{ev.note}</p>
                    )}
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                      <span className="font-mono">{formatDate(ev.date)}</span>
                      <span className="text-border">|</span>
                      <span className="font-medium">{ev.source}</span>
                      <a
                        href={ev.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        source <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* related knowledge */}
          {related.length > 0 && (
            <section className="mt-7">
              <h2 className="mb-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Related Knowledge
              </h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {related.map(
                  (k) =>
                    k && (
                      <KnowledgeCard
                        key={k.id}
                        item={k}
                        href={`/project/${slug}/knowledge/${k.id}`}
                      />
                    )
                )}
              </div>
            </section>
          )}
        </ReadingModeShell>

        {/* ---------- kolom kanan: sticky metadata sidebar ---------- */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
          <div className="space-y-4">
            {/* confidence gauge */}
            <Card>
              <CardContent className="flex flex-col items-center p-4">
                <ConfidenceGauge value={item.confidence} />
                <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">
                  Aggregate certainty across {item.evidence.length} weighted evidence items.
                </p>
              </CardContent>
            </Card>

            {/* metadata */}
            <Card>
              <CardContent className="space-y-2.5 p-4">
                {[
                  { label: "Status", value: item.status },
                  { label: "Category", value: item.category },
                  { label: "Updated", value: formatDate(item.updatedAt) },
                  { label: "Author", value: item.author },
                ].map((m) => (
                  <div key={m.label} className="flex items-center justify-between gap-2 text-[12px]">
                    <span className="text-muted-foreground">{m.label}</span>
                    <span className="font-medium text-foreground">{m.value}</span>
                  </div>
                ))}
                <div className="flex items-center justify-between gap-2 text-[12px]">
                  <span className="text-muted-foreground">Avg evidence weight</span>
                  <span className="font-mono text-foreground">
                    {item.evidence.length > 0
                      ? (item.evidence.reduce((s, e) => s + e.weight, 0) / item.evidence.length).toFixed(1)
                      : "—"}
                    /5
                  </span>
                </div>
              </CardContent>
            </Card>

            {/* dependencies */}
            <Card>
              <CardContent className="p-4">
                <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Dependencies
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {item.relatedKnowledge.length === 0 && (
                    <span className="text-[11px] text-muted-foreground/70">—</span>
                  )}
                  {item.relatedKnowledge.map((kid) => (
                    <Link
                      key={kid}
                      href={`/project/${slug}/knowledge/${kid}`}
                      className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[11px] text-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                      {kid}
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* data lineage flowchart */}
            <Card>
              <CardContent className="p-4">
                <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Data Lineage
                </div>
                <div className="space-y-1.5">
                  <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                      <Database className="h-3.5 w-3.5 text-amber-400" /> Raw Data
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {dependencyEvents.map((e) => (
                        <Link
                          key={e.id}
                          href={`/project/${slug}/timeline?event=${e.id}`}
                          className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px] text-foreground hover:border-primary"
                        >
                          {e.id}
                        </Link>
                      ))}
                    </div>
                  </div>
                  <ArrowDown className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  <div className="rounded-md border border-primary/30 bg-primary/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                      <Fingerprint className="h-3.5 w-3.5 text-primary" /> Pattern
                    </div>
                    <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">
                      {item.evidence.length} evidence traces disintesis
                    </p>
                  </div>
                  <ArrowDown className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                  <div className="rounded-md border border-success/30 bg-success/5 p-2.5">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
                      <Lightbulb className="h-3.5 w-3.5 text-success" /> Knowledge
                    </div>
                    <p className="mt-1 font-mono text-[10.5px] text-muted-foreground">
                      {item.id} · {item.confidence}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>
      </div>

      {/* full evidence table (advanced) */}
      <div className="mt-2">
        <h2 className="mb-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          Evidence Registry
        </h2>
        <EvidenceTrace evidence={item.evidence} />
      </div>

      {/* audit trail per baris — riwayat setiap perubahan knowledge item ini */}
      <RowHistory table="knowledge_items" rowId={item.id} />

      <PrivateNote slug={slug} id={item.id} title={`Private Note — ${item.id}`} />
    </div>
  );
}

function ArrowDown({ className }: { className?: string }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M12 5v14" />
      <path d="m19 12-7 7-7-7" />
    </svg>
  );
}


