"use client";

import dynamic from "next/dynamic";
import type { Entity, Relationship } from "@/lib/types/entity";
import type { TimelineEvent } from "@/lib/types/event";
import type { KnowledgeItem } from "@/lib/types/knowledge";

// "Live Intelligence Radar" — komponen berat (React Flow + dagre + d3-force)
// di-load lazy, dengan shimmer skeleton selama chunk streaming.
const EntityGraphV2 = dynamic(
  () => import("@/components/graph/EntityGraphV2").then((m) => m.EntityGraphV2),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full flex-col gap-3 p-6">
        <div className="shimmer h-9 w-64 rounded-md" />
        <div className="flex flex-1 gap-3">
          <div className="shimmer flex-1 rounded-lg" />
          <div className="shimmer w-80 rounded-lg" />
        </div>
      </div>
    ),
  }
);

export function EntityGraphLoader({
  entities,
  relationships,
  events,
  knowledge,
  projectSlug,
  initialEntityId,
}: {
  entities: Entity[];
  relationships: Relationship[];
  events: TimelineEvent[];
  knowledge: KnowledgeItem[];
  projectSlug: string;
  initialEntityId?: string;
}) {
  return (
    <EntityGraphV2
      entities={entities}
      relationships={relationships}
      events={events}
      knowledge={knowledge}
      projectSlug={projectSlug}
      initialEntityId={initialEntityId}
    />
  );
}
