import { notFound } from "next/navigation";
import { GitMerge } from "lucide-react";
import { projectRepository, conflictRepository } from "@/lib/api/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConflictListWithSync } from "@/components/conflicts/ConflictListWithSync";
import { ConflictAnalytics } from "@/components/conflicts/ConflictAnalytics";
import { ViewManager } from "@/components/layout/ViewManager";
import { Badge } from "@/components/ui/badge";

const VALID_SEVERITY = ["All", "Critical", "High", "Medium", "Low"] as const;
const VALID_STATUS = ["All", "Resolved", "Unresolved"] as const;

export default async function ConflictsPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ severity?: string; status?: string }>;
}) {
  const { slug } = await params;
  const { severity, status } = await searchParams;
  const [project, conflicts] = await Promise.all([
    projectRepository.get(slug),
    conflictRepository.list(slug),
  ]);
  if (!project) notFound();
  const critical = conflicts.filter((c) => c.severity === "Critical").length;
  const unresolved = conflicts.filter((c) => c.status === "Unresolved").length;
  const resolved = conflicts.filter((c) => c.status === "Resolved").length;
  const initialSeverity = VALID_SEVERITY.includes(severity as never)
    ? (severity as (typeof VALID_SEVERITY)[number])
    : "All";
  const initialStatus = VALID_STATUS.includes(status as never)
    ? (status as (typeof VALID_STATUS)[number])
    : "All";

  return (
    <div>
      <PageHeader
        icon={GitMerge}
        title="Conflict Center"
        description="Contradictory claims across sources, resolved in Git merge-conflict style. Deep-links support ?severity=High&status=Unresolved."
      >
        <ViewManager
          scope="conflicts"
          filters={{ severity: initialSeverity, status: initialStatus }}
          basePath={`/project/${slug}/conflicts`}
        />
        {critical > 0 && <Badge variant="critical">{critical} critical</Badge>}
        <Badge variant="muted">{conflicts.length} conflicts</Badge>
      </PageHeader>

      {/* War-room signal: keputusan terbuka dan yang sudah ditutup. */}
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div className="rounded-lg border border-cif-signal-rose/25 bg-cif-signal-rose/5 p-4">
          <div className="font-mono text-3xl font-bold tabular-nums text-cif-signal-rose">{unresolved}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Unresolved</div>
        </div>
        <div className="rounded-lg border border-cif-signal-green/25 bg-cif-signal-green/5 p-4">
          <div className="font-mono text-3xl font-bold tabular-nums text-cif-signal-green">{resolved}</div>
          <div className="mt-1 text-[10px] font-semibold uppercase tracking-[.14em] text-muted-foreground">Resolved</div>
        </div>
      </div>

      <ConflictAnalytics conflicts={conflicts} />

      <ConflictListWithSync
        conflicts={conflicts}
        baseHref={`/project/${slug}/conflicts`}
        initialSeverity={initialSeverity}
        initialStatus={initialStatus}
      />
    </div>
  );
}
