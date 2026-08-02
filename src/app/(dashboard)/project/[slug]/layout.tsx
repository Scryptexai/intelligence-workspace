import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { projectRepository } from "@/lib/api/repositoriesServer";
import { getProjects } from "@/lib/data/projects";
import { ProjectTabs } from "@/components/layout/ProjectTabs";
import { OnboardingTour } from "@/components/tour/OnboardingTour";

/**
 * generateStaticParams memberi tahu client router slug mana yang valid,
 * sehingga back-navigation ke /project/[slug] tidak pernah jatuh ke 404
 * (bug router saat dynamic route tanpa params).
 */
export function generateStaticParams() {
  return getProjects().map((p) => ({ slug: p.slug }));
}

export default async function ProjectLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = await projectRepository.get(slug);
  if (!project) notFound();

  return (
    <div>
      <ProjectTabs slug={slug} />
      <div className="p-4 lg:p-6">{children}</div>
      <OnboardingTour slug={slug} />
    </div>
  );
}
