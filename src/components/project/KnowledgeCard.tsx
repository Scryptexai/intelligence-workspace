import Link from "next/link";
import { memo } from "react";
import { ArrowUpRight, Database, Link2 } from "lucide-react";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils/helpers";
import { fingerprintId } from "@/lib/utils/fingerprint";
import { CifCard } from "@/components/ui/cif-card";

const STATUS_VARIANT: Record<KnowledgeItem["status"], "success" | "default" | "warning" | "muted"> = {
  Stable: "success", Emerging: "default", Volatile: "warning", Deprecated: "muted",
};
const STATUS_SIGNAL: Record<KnowledgeItem["status"], string> = {
  Stable: "bg-cif-signal-amber", Emerging: "bg-cif-signal-cyan", Volatile: "bg-cif-signal-rose", Deprecated: "bg-slate-600",
};

function SignalBars({ confidence }: { confidence: number }) {
  const filled = confidence >= 80 ? 3 : confidence >= 45 ? 2 : confidence > 0 ? 1 : 0;
  return <span aria-label={`Confidence ${confidence}%`} className="flex h-5 items-end gap-0.5">{[1, 2, 3].map((bar) => <i key={bar} className={`w-1 rounded-sm ${bar <= filled ? "bg-cif-signal-cyan" : "bg-white/10"}`} style={{ height: `${bar * 5 + 3}px` }} />)}</span>;
}

/** Baris dossier modular: status, narasi & jejak bukti, lalu sinyal keputusan. */
export const KnowledgeCard = memo(function KnowledgeCard({ item, href }: { item: KnowledgeItem; href: string }) {
  const sources = [...new Set(item.evidence.map((e) => e.source).filter(Boolean))].slice(0, 3);
  return (
    <Link href={href} className="group block">
      <CifCard className="relative flex min-h-[132px] overflow-hidden hover:-translate-y-0.5">
        <span className={`w-1 shrink-0 ${STATUS_SIGNAL[item.status]}`} aria-hidden />
        <div className="min-w-0 flex-1 p-4">
          <div className="flex items-start gap-2">
            <h3 className="line-clamp-1 text-[14px] font-bold tracking-[-.02em] text-foreground group-hover:text-cif-signal-cyan">{item.name}</h3>
            <Badge variant={STATUS_VARIANT[item.status]} className="ml-auto shrink-0">{item.status}</Badge>
          </div>
          <p className="mt-1 line-clamp-1 text-[12px] leading-relaxed text-muted-foreground">{item.description || "Belum ada ringkasan untuk objek pengetahuan ini."}</p>
          <div className="mt-3 flex min-w-0 items-center gap-1.5 text-[10px] text-cif-signal-cyan">
            <Link2 className="h-3 w-3 shrink-0" />
            <span className="font-semibold uppercase tracking-[.1em] text-muted-foreground">Evidence trace</span>
            {sources.length ? sources.map((source) => <span key={source} className="max-w-20 truncate rounded border border-cif-signal-cyan/20 bg-cif-signal-cyan/10 px-1.5 py-0.5 font-mono">{source}</span>) : <span className="text-muted-foreground">Belum ada evidence</span>}
          </div>
        </div>
        <div className="flex w-[100px] shrink-0 flex-col items-end border-l border-border/70 p-3 text-right">
          <div className="flex items-center gap-1.5"><SignalBars confidence={item.confidence} /><span className="font-mono text-[17px] font-bold tabular-nums text-foreground">{item.confidence}</span></div>
          <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-[.1em] text-muted-foreground">confidence</span>
          <span className="mt-auto flex items-center gap-1 font-mono text-[9px] text-muted-foreground"><Database className="h-3 w-3" />{fingerprintId(item.id)}</span>
          <span className="mt-2 flex items-center gap-1 text-[11px] font-medium text-cif-accent">Detail <ArrowUpRight className="h-3 w-3" /></span>
        </div>
        <time className="sr-only">Diperbarui {formatDate(item.updatedAt)}</time>
      </CifCard>
    </Link>
  );
});
