import Link from "next/link";
import { memo } from "react";
import { Star } from "lucide-react";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils/helpers";

const STATUS_VARIANT: Record<
  KnowledgeItem["status"],
  "success" | "default" | "warning" | "muted"
> = {
  Stable: "success",
  Emerging: "default",
  Volatile: "warning",
  Deprecated: "muted",
};

interface KnowledgeCardProps {
  item: KnowledgeItem;
  href: string;
}

/**
 * Memoized list item — skips re-render when unrelated filters change.
 * `item` and `href` are stable references from memoized arrays.
 */
export const KnowledgeCard = memo(function KnowledgeCard({
  item,
  href,
}: KnowledgeCardProps) {
  const avgWeight =
    item.evidence.length > 0
      ? Math.round(
          item.evidence.reduce((s, e) => s + e.weight, 0) / item.evidence.length
        )
      : 0;

  return (
    <Link
      href={href}
      className="project-glow-hover group flex h-full flex-col rounded-lg border border-border bg-card p-4"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="line-clamp-2 text-[13.5px] font-semibold leading-snug text-foreground group-hover:text-primary">
          {item.name}
        </h3>
        <Badge variant={STATUS_VARIANT[item.status]} className="shrink-0">
          {item.status}
        </Badge>
      </div>

      <p className="mt-1.5 line-clamp-2 text-[12px] leading-relaxed text-muted-foreground">
        {item.description}
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
        <Badge variant="secondary" className="normal-case tracking-normal">
          {item.category}
        </Badge>
        <span
          className="flex items-center gap-1 font-mono"
          title={`Average evidence weight ${avgWeight}/5`}
        >
          <Star className="h-3 w-3 text-warning" />
          {avgWeight}/5
        </span>
        <span className="font-mono">{item.evidence.length} ev</span>
        <span className="text-muted-foreground/50">·</span>
        <span className="font-mono">{formatDate(item.updatedAt)}</span>
        <span className="ml-auto font-mono text-[11px] font-semibold tabular-nums text-foreground">
          {item.confidence}%
        </span>
      </div>

      <div className="mt-2.5">
        <Progress
          value={item.confidence}
          className={item.confidence >= 80 ? "[&>div]:bg-success" : ""}
        />
      </div>

      {/* internal reference kept subtle for deep-linking */}
      <div className="mt-auto pt-2.5 text-[10px] font-mono text-muted-foreground/55">
        ID: {item.id}
      </div>
    </Link>
  );
});
