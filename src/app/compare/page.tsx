"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { GitCompareArrows } from "lucide-react";
import { useProjectsList } from "@/hooks/useProjectQuery";
import { useKnowledgeQuery } from "@/hooks/useResourceQueries";
import { getProjects, getKnowledge } from "@/lib/data";
import { PageHeader } from "@/components/layout/PageHeader";
import { CompareTable } from "@/components/compare/CompareTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ECharts radar only needed on this page — lazy chunk.
const RadarChart = dynamic(() => import("@/components/qa/RadarChart").then((m) => m.RadarChart), {
  loading: () => <div className="shimmer h-[360px] w-full rounded-lg" />,
});
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function ComparePage() {
  // Data-source agnostic: TanStack Query via repository (placeholder = mock sync)
  const fallbackProjects = useMemo(() => getProjects(), []);
  const { data: projectsData } = useProjectsList();
  const projects =
    Array.isArray(projectsData) && projectsData.length > 0 ? projectsData : fallbackProjects;

  const [aSlug, setASlug] = useState(fallbackProjects[0]?.slug ?? "");
  const [bSlug, setBSlug] = useState(fallbackProjects[1]?.slug ?? fallbackProjects[0]?.slug ?? "");

  // Tahan terhadap slug yang tidak ada di daftar (mis. fallback mock) dan
  // daftar dengan 0/1 project — jangan pernah undefined.
  const a = projects.find((p) => p.slug === aSlug) ?? projects[0];
  const b =
    projects.find((p) => p.slug === bSlug) ??
    projects[1] ??
    projects[0];

  const { data: knowledgeAData } = useKnowledgeQuery(a?.slug ?? "");
  const { data: knowledgeBData } = useKnowledgeQuery(b?.slug ?? "");
  const knowledgeA = knowledgeAData ?? getKnowledge(a?.slug ?? "");
  const knowledgeB = knowledgeBData ?? getKnowledge(b?.slug ?? "");

  if (!a || !b) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
        <PageHeader
          icon={GitCompareArrows}
          title="Compare Projects"
          description="Side-by-side intelligence comparison: CIF metrics, knowledge overlap and behavioral patterns."
        />
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-[13px] text-muted-foreground">
            Belum ada project yang bisa dibandingkan. Tambahkan minimal satu
            project di Supabase terlebih dahulu.
          </p>
        </div>
      </div>
    );
  }

  const dimsA = a.qa?.dimensions ?? [];
  const dimsB = b.qa?.dimensions ?? [];
  const hasRadar = dimsA.length > 0 && dimsB.length > 0;

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-4 lg:p-6">
      <PageHeader
        icon={GitCompareArrows}
        title="Compare Projects"
        description="Side-by-side intelligence comparison: CIF metrics, knowledge overlap and behavioral patterns."
      />

      {/* selectors */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            Baseline
          </span>
          <Select value={a.slug} onValueChange={setASlug}>
            <SelectTrigger className="h-9 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name} ({p.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            vs
          </span>
          <Select value={b.slug} onValueChange={setBSlug}>
            <SelectTrigger className="h-9 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {projects.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.name} ({p.symbol})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Badge variant="muted">{a.symbol}</Badge>
          <span className="text-[11px] text-muted-foreground">vs</span>
          <Badge variant="muted">{b.symbol}</Badge>
        </div>
      </div>

      {/* radar overlay */}
      <Card>
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
            CIF Dimension Overlay
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 pt-0">
          {hasRadar ? (
            <RadarChart
              dims={dimsA.map((d) => ({ label: d.label }))}
              series={[
                {
                  name: a.name,
                  color: a.color,
                  values: dimsA.map((d) => d.score),
                },
                {
                  name: b.name,
                  color: b.color,
                  values: dimsB.map((d) => d.score),
                },
              ]}
              height={360}
            />
          ) : (
            <div className="flex h-[360px] items-center justify-center rounded-md border border-dashed border-border/70">
              <p className="max-w-sm text-center text-[12px] text-muted-foreground">
                Data dimensi CIF belum tersedia untuk salah satu project.
                Lengkapi tabel <span className="font-mono">qa_dimensions</span> di
                Supabase untuk menampilkan radar overlay.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <CompareTable a={a} b={b} knowledgeA={knowledgeA} knowledgeB={knowledgeB} />
    </div>
  );
}
