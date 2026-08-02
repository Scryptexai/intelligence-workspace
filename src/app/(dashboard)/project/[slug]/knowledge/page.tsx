import { notFound } from "next/navigation";
import { BookOpen } from "lucide-react";
import { projectRepository, knowledgeRepository } from "@/lib/api/repositoriesServer";
import { PageHeader } from "@/components/layout/PageHeader";
import { KnowledgeListWithSync } from "@/components/knowledge/KnowledgeListWithSync";
import { ViewManager } from "@/components/layout/ViewManager";
import { Badge } from "@/components/ui/badge";

const VALID_STATUS = ["All", "Stable", "Emerging", "Volatile", "Deprecated"] as const;

export const dynamic = "force-dynamic";

export default async function KnowledgePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const { slug } = await params;
  const { status, q } = await searchParams;
  const [project, knowledge] = await Promise.all([
    projectRepository.get(slug),
    knowledgeRepository.list(slug),
  ]);
  if (!project) notFound();
  const stable = knowledge.filter((k) => k.status === "Stable").length;
  const initialStatus = VALID_STATUS.includes(status as never)
    ? (status as (typeof VALID_STATUS)[number])
    : "All";

  return (
    <div>
      <PageHeader
        icon={BookOpen}
        title="Knowledge Ledger"
        description="Every knowledge item is traceable to dated, weighted evidence — Git blame for intelligence. Deep-links support ?status=Volatile&q=treasury."
      >
        <ViewManager
          scope="knowledge"
          filters={{ status: initialStatus, q: q ?? "" }}
          basePath={`/project/${slug}/knowledge`}
        />
        <Badge variant="success">{stable} stable</Badge>
        <Badge variant="muted">{knowledge.length} total</Badge>
      </PageHeader>
      <KnowledgeListWithSync
        items={knowledge}
        baseHref={`/project/${slug}/knowledge`}
        initialQuery={q ?? ""}
        initialStatus={initialStatus}
      />
    </div>
  );
}
