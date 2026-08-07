import { notFound } from "next/navigation";
import { Radar } from "lucide-react";
import dynamic from "next/dynamic";
import { projectRepository, qaRepository } from "@/lib/api/server";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils/helpers";

const PHASE_STATUS_VARIANT: Record<string, "success" | "warning" | "critical" | "muted"> = {
  Passed: "success",
  "In Progress": "warning",
  Blocked: "critical",
  "Not Started": "muted",
};

// ECharts widgets are split into their own chunks — loaded only on this page.
const RadarChart = dynamic(() => import("@/components/qa/RadarChart").then((m) => m.RadarChart), {
  loading: () => <div className="shimmer h-[380px] w-full rounded-lg" />,
});
const DonutChart = dynamic(() => import("@/components/qa/DonutChart").then((m) => m.DonutChart), {
  loading: () => <div className="shimmer h-[220px] w-full rounded-lg" />,
});

export default async function QAPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [project, qaData] = await Promise.all([
    projectRepository.get(slug),
    qaRepository.get(slug),
  ]);
  if (!project) notFound();

  // Fallback: gunakan QA yang tertanam di project kalau endpoint QA kosong.
  const qa = qaData ?? project.qa;

  if (!qa) {
    return (
      <div className="space-y-6">
        <PageHeader
          icon={Radar}
          title="QA Center"
          description="Quality assurance across six CIF dimensions."
        />
        <div className="rounded-lg border border-dashed border-border py-16 text-center">
          <p className="text-[13px] text-muted-foreground">
            QA report belum tersedia untuk proyek ini.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        icon={Radar}
        title="QA Center"
        description="Quality assurance across six CIF dimensions, phase status, and the weighted contribution of each dimension to the overall score."
      >
        <Badge variant="success">CIF {qa.total}</Badge>
      </PageHeader>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-5">
        {/* radar */}
        <Card className="xl:col-span-2">
          <CardHeader className="p-4 pb-0">
            <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Dimension Radar
            </CardTitle>
          </CardHeader>
          <CardContent className="p-2 pt-0">
            <RadarChart
              dims={qa.dimensions.map((d) => ({ label: d.label }))}
              series={[
                {
                  name: project.name,
                  color: project.color,
                  values: qa.dimensions.map((d) => d.score),
                },
              ]}
              footnote="Research grounded in 10 completed evidence phases · weighted across 6 CIF dimensions"
            />
          </CardContent>
        </Card>

        {/* breakdown */}
        <div className="space-y-6 xl:col-span-3">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Weight Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <DonutChart
                  items={qa.dimensions.map((d) => ({ name: d.label, value: d.weight }))}
                  color={project.color}
                  centerLabel="weights %"
                  centerValue={String(qa.dimensions.reduce((s, d) => s + d.weight, 0))}
                />
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="p-4 pb-0">
                <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Dimension Radar
                </CardTitle>
              </CardHeader>
              <CardContent className="p-2 pt-0">
                <RadarChart
                  dims={qa.dimensions.map((d) => ({ label: d.label }))}
                  series={[
                    {
                      name: project.name,
                      color: project.color,
                      values: qa.dimensions.map((d) => d.score),
                    },
                  ]}
                  height={240}
                />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Score Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 pt-2">
              {qa.dimensions.map((d) => {
                const contribution = Math.round(d.score * d.weight) / 100;
                return (
                  <div key={d.key}>
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="flex items-center gap-1 text-[12.5px] font-medium text-foreground">
                        {d.label}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="inline-flex text-muted-foreground/70 hover:text-primary">
                              <HelpCircle className="h-3 w-3" />
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px]">
                            {d.description}
                          </TooltipContent>
                        </Tooltip>
                      </span>
                      <span className="font-mono text-[11px] tabular-nums text-muted-foreground">
                        {d.score} × {d.weight}% ={" "}
                        <span className="font-bold text-foreground">{contribution.toFixed(1)}</span>
                      </span>
                    </div>
                    <div className="mt-1.5 flex items-center gap-2">
                      <Progress value={d.score} className="h-2" />
                      <span
                        className={cn(
                          "w-14 text-right font-mono text-[11px] tabular-nums",
                          d.score >= 80
                            ? "text-success"
                            : d.score >= 60
                              ? "text-warning"
                              : "text-critical"
                        )}
                      >
                        {d.score}/100
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                      {d.description}
                    </p>
                  </div>
                );
              })}
              <div className="flex items-center justify-between rounded-md border border-primary/30 bg-primary/5 px-3 py-2">
                <span className="text-[12px] font-semibold uppercase tracking-[0.12em] text-primary">
                  Weighted CIF Score
                </span>
                <span className="font-mono text-lg font-bold tabular-nums text-foreground">
                  {qa.total}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="p-4 pb-2">
              <CardTitle className="text-[13px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                Phase Status
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-2">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {qa.phases.map((ph) => (
                  <div
                    key={ph.name}
                    className="flex items-center gap-3 rounded-md border border-border/70 bg-muted/30 px-3 py-2.5"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[12.5px] font-medium text-foreground">
                        {ph.name}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {ph.owner}
                      </div>
                    </div>
                    <Badge variant={PHASE_STATUS_VARIANT[ph.status]}>{ph.status}</Badge>
                    <span className="font-mono text-[12px] font-bold tabular-nums text-foreground">
                      {ph.score}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
