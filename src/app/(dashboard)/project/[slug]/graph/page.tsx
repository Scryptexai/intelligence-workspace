import { notFound } from "next/navigation";
import { Network } from "lucide-react";
import { projectRepository, entityRepository, eventRepository, knowledgeRepository } from "@/lib/api/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { EntityGraphLoader } from "@/components/graph/EntityGraphLoader";
import { Badge } from "@/components/ui/badge";

export default async function GraphPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ entity?: string; node?: string }>;
}) {
  const { slug } = await params;
  const { entity, node } = await searchParams;
  const initial = entity ?? node;

  const [project, entities, relationships, events, knowledge] = await Promise.all([
    projectRepository.get(slug),
    entityRepository.list(slug),
    entityRepository.relationships(slug),
    eventRepository.list(slug),
    knowledgeRepository.list(slug),
  ]);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Network}
        title="Live Intelligence Radar"
        description="Peta interaktif arus pengaruh & ketergantungan antar entitas. Klik untuk detail, double-click untuk Focus Mode, gunakan toolbar floating di kiri bawah."
      >
        <Badge variant="muted">{entities.length} entities</Badge>
        <Badge variant="muted">{relationships.length} relationships</Badge>
      </PageHeader>

      <div className="h-[calc(100vh-320px)] min-h-[560px] overflow-hidden rounded-lg border border-border bg-grid">
        <EntityGraphLoader
          entities={entities}
          relationships={relationships}
          events={events}
          knowledge={knowledge}
          projectSlug={slug}
          initialEntityId={initial}
        />
      </div>
    </div>
  );
}
