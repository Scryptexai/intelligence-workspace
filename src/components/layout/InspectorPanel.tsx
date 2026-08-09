"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { GitCommitHorizontal, Hash, Info, Keyboard } from "lucide-react";
import { useProjectBundle } from "@/hooks/useProjectQuery";
import { useKnowledgeQuery } from "@/hooks/useResourceQueries";
import { cn } from "@/lib/utils/helpers";
import { fingerprintId } from "@/lib/utils/fingerprint";

/**
 * Inspector — panel konteks kanan (gaya Obsidian).
 * Menampilkan metadata item yang sedang dibuka; konten utama tetap utuh.
 * Konteks: knowledge detail → metadata knowledge; project → ringkasan;
 * selain itu → tip workspace.
 */
export function InspectorPanel() {
  const pathname = usePathname();

  // /project/[slug]/knowledge/[id]
  const kMatch = pathname.match(/^\/project\/([^/]+)\/knowledge\/([^/]+)/);
  // /project/[slug]
  const pMatch = pathname.match(/^\/project\/([^/]+)/);

  if (kMatch) return <KnowledgeInspector slug={kMatch[1]} id={kMatch[2]} />;
  if (pMatch) return <ProjectInspector slug={pMatch[1]} />;
  return <GenericInspector />;
}

/* ------------------------------------------------------------------ */

function KnowledgeInspector({ slug, id }: { slug: string; id: string }) {
  const { data: knowledge } = useKnowledgeQuery(slug);
  const item = knowledge?.find((k) => k.id === id);

  return (
    <aside className="cif-inspector hidden w-72 shrink-0 flex-col border-l border-border bg-card/60 lg:flex">
      <div className="flex h-9 items-center gap-1.5 border-b border-border px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Hash className="h-3 w-3 text-primary" /> Inspector
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {!item ? (
          <p className="text-[11.5px] text-muted-foreground">Memuat metadata item…</p>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                  {item.category || "Knowledge"}
                </span>
                <span className="font-mono text-[10px] text-primary">{fingerprintId(item.id)}</span>
              </div>
              <div className="text-[13px] font-semibold leading-snug text-foreground">{item.name}</div>
              <dl className="mt-3 space-y-1.5 text-[11.5px]">
                {[
                  ["Status", item.status],
                  ["Confidence", `${item.confidence}%`],
                  ["Evidence", `${item.evidence.length} traces`],
                  ["Author", item.author || "—"],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-center justify-between gap-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-mono text-[11px] text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 text-[11.5px]">
              <div className="mb-1.5 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                <GitCommitHorizontal className="h-3 w-3" /> Audit trail
              </div>
              <p className="text-muted-foreground">
                Riwayat perubahan per baris tersedia di bawah halaman (Row History).
              </p>
              <Link
                href={`/project/${slug}/knowledge`}
                className="mt-2 inline-block text-[11px] text-primary hover:underline"
              >
                ← Kembali ke Knowledge Ledger
              </Link>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */

function ProjectInspector({ slug }: { slug: string }) {
  const { data: bundle } = useProjectBundle(slug);
  const p = bundle?.project;

  return (
    <aside className="cif-inspector hidden w-72 shrink-0 flex-col border-l border-border bg-card/60 lg:flex">
      <div className="flex h-9 items-center gap-1.5 border-b border-border px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Info className="h-3 w-3 text-primary" /> Inspector
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        {!p ? (
          <p className="text-[11.5px] text-muted-foreground">Memuat profil project…</p>
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-mono text-[11px] text-primary">{p.symbol}</span>
                <span className="font-mono text-[10px] text-muted-foreground/70">
                  {fingerprintId(p.slug)}
                </span>
              </div>
              <div className="text-[13px] font-semibold leading-snug text-foreground">{p.name}</div>
              <div className="mt-2 font-mono text-2xl font-extrabold" style={{ color: "#f59e0b" }}>
                {p.cifScore}
                <span className="ml-1 text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  CIF
                </span>
              </div>
              <dl className="mt-3 grid grid-cols-2 gap-1.5 text-[11px]">
                {[
                  ["Confidence", `${p.confidence}%`],
                  ["Knowledge", p.knowledgeCount],
                  ["Conflicts", p.conflictCount],
                  ["Events", p.eventCount],
                  ["Entities", p.entityCount],
                  ["Coverage", `${p.coverage}%`],
                ].map(([k, v]) => (
                  <div key={k} className="rounded border border-border bg-muted/30 px-2 py-1">
                    <div className="text-[9px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="font-mono text-[11.5px] font-bold text-foreground">{v}</div>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-lg border border-border bg-card p-3 text-[11.5px]">
              <div className="mb-1 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
                Health
              </div>
              <p className={cn("font-mono text-[12px] font-bold", p.coverage < 60 ? "text-destructive" : "text-success")}>
                {p.coverage < 60 ? "CRITICAL" : "STABLE"}
              </p>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------------ */

function GenericInspector() {
  return (
    <aside className="cif-inspector hidden w-72 shrink-0 flex-col border-l border-border bg-card/60 lg:flex">
      <div className="flex h-9 items-center gap-1.5 border-b border-border px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">
        <Keyboard className="h-3 w-3 text-primary" /> Inspector
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto p-3">
        <div className="rounded-lg border border-border bg-card p-3 text-[11.5px] leading-relaxed text-muted-foreground">
          <div className="mb-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">
            Shortcuts
          </div>
          {[
            ["⌘K", "Command Center"],
            ["⌘1–5", "Mode project"],
            ["⌘⇧E", "Explorer"],
          ].map(([k, v]) => (
            <div key={k} className="flex items-center justify-between py-0.5">
              <kbd className="rounded border border-border bg-muted px-1.5 font-mono text-[10px] text-foreground">
                {k}
              </kbd>
              <span>{v}</span>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-card p-3 text-[11.5px] leading-relaxed text-muted-foreground">
          Buka sebuah project atau knowledge untuk melihat metadata & audit
          trail di panel ini.
        </div>
      </div>
    </aside>
  );
}
