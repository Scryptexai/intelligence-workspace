import { notFound } from "next/navigation";
import { Bot } from "lucide-react";
import { projectRepository, knowledgeRepository } from "@/lib/api";
import { PageHeader } from "@/components/layout/PageHeader";
import { CopilotChat } from "@/components/copilot/CopilotChat";

export default async function CopilotPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, knowledge] = await Promise.all([
    projectRepository.get(slug),
    knowledgeRepository.list(slug),
  ]);
  if (!project) notFound();

  return (
    <div>
      <PageHeader
        icon={Bot}
        title="AI Copilot"
        description="UI-only demo. The copilot reasons across the knowledge ledger and cites traceable knowledge items with deep links."
      />
      <CopilotChat slug={slug} projectName={project.name} knowledge={knowledge} />
    </div>
  );
}
