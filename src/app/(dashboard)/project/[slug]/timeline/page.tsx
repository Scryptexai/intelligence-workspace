import { notFound } from "next/navigation";
import { Activity } from "lucide-react";
import { projectRepository, eventRepository } from "@/lib/api/repositoriesServer";
import { PageHeader } from "@/components/layout/PageHeader";
import { LiveTimeline } from "@/components/timeline/LiveTimeline";
import { Badge } from "@/components/ui/badge";

export default async function TimelinePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ event?: string }>;
}) {
  const { slug } = await params;
  const { event } = await searchParams;
  const [project, events] = await Promise.all([
    projectRepository.get(slug),
    eventRepository.list(slug),
  ]);
  if (!project) notFound();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        icon={Activity}
        title="Live Timeline"
        description="Chronological intelligence feed. Filter by event type, group by period, zoom with the slider, and click an event to trace its affected knowledge."
      >
        <Badge variant="muted">{events.length} events</Badge>
        <Badge variant="success">live</Badge>
      </PageHeader>

      <LiveTimeline
        events={events}
        projectSlug={slug}
        initialEventId={event}
      />
    </div>
  );
}
