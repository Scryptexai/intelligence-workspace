import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, GitMerge } from "lucide-react";
import { projectRepository, conflictRepository } from "@/lib/api";
import { getProjects, getConflicts } from "@/lib/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { ConflictDiff } from "@/components/conflicts/ConflictDiff";
import { MarkdownCopyButton } from "@/components/export/MarkdownCopyButton";
import { PrivateNote } from "@/components/notes/PrivateNote";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildConflictMarkdown } from "@/lib/report";

const SEVERITY_VARIANT: Record<string, "critical" | "warning" | "default" | "muted"> = {
  Critical: "critical",
  High: "warning",
  Medium: "default",
  Low: "muted",
};

/** Pre-render semua conflict detail agar back-navigation tidak pernah 404. */
export function generateStaticParams() {
  return getProjects().flatMap((p) =>
    getConflicts(p.slug).map((c) => ({ slug: p.slug, id: c.id }))
  );
}

export default async function ConflictDetailPage({
  params,
}: {
  params: Promise<{ slug: string; id: string }>;
}) {
  const { slug, id } = await params;
  const [project, conflict] = await Promise.all([
    projectRepository.get(slug),
    conflictRepository.get(slug, id),
  ]);
  if (!project) notFound();
  if (!conflict) notFound();

  return (
    <div className="space-y-5">
      <Button asChild variant="ghost" size="sm" className="h-7 gap-1 text-[12px] text-muted-foreground">
        <Link href={`/project/${slug}/conflicts`}>
          <ArrowLeft className="h-3.5 w-3.5" /> Back to conflicts
        </Link>
      </Button>

      <PageHeader
        icon={GitMerge}
        title={conflict.title}
        description={conflict.description}
      >
        <MarkdownCopyButton
          content={buildConflictMarkdown(conflict, slug)}
          label="Copy as Markdown"
          variant="outline"
          className="h-8"
        />
        <span className="font-mono text-[11px] text-muted-foreground/70">ID: {conflict.id}</span>
        <Badge variant={SEVERITY_VARIANT[conflict.severity]}>{conflict.severity}</Badge>
        <Badge variant={conflict.status === "Resolved" ? "success" : "muted"}>
          {conflict.status}
        </Badge>
        <Badge variant="secondary" className="normal-case tracking-normal">
          {conflict.category}
        </Badge>
      </PageHeader>

      <ConflictDiff conflict={conflict} projectSlug={slug} />

      <PrivateNote slug={slug} id={conflict.id} title={`Private Note — ${conflict.id}`} />
    </div>
  );
}
