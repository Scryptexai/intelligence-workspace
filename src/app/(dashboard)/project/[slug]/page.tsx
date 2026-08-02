import { notFound } from "next/navigation";
import { projectRepository, knowledgeRepository, eventRepository } from "@/lib/api/repositoriesServer";
import { ProjectLogo } from "@/components/brand/ProjectLogo";
import { DashboardGrid } from "@/components/overview/DashboardGrid";
import { ReportExport } from "@/components/export/ReportExport";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function ProjectOverview({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, knowledge, events] = await Promise.all([
    projectRepository.get(slug),
    knowledgeRepository.list(slug),
    eventRepository.list(slug),
  ]);
  if (!project) notFound();

  return (
    <div className="space-y-5">
      {/* hero */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <ProjectLogo symbol={project.symbol} slug={slug} size={54} />
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">
                {project.name}
              </h1>
              <Badge variant="muted">{project.status}</Badge>
              <Badge variant="success">{project.confidence}% confidence</Badge>
            </div>
            <p className="mt-1 text-[13px] text-muted-foreground">{project.tagline}</p>
            <p className="mt-2 max-w-2xl text-[12.5px] leading-relaxed text-muted-foreground">
              {project.description}
            </p>
            <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
              {project.tags.map((t) => (
                <Badge key={t} variant="secondary" className="normal-case tracking-normal">
                  {t}
                </Badge>
              ))}
              <span className="ml-auto self-center text-[11px] text-muted-foreground">
                updated {project.lastActivityHours}h ago
              </span>
            </div>
          </div>
        </div>
        <ReportExport project={project} knowledge={knowledge} events={events} />
      </div>

      {/* draggable intelligence grid */}
      <DashboardGrid slug={slug} />
    </div>
  );
}
