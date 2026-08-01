"use client";

import dynamic from "next/dynamic";
import { FileText } from "lucide-react";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { TimelineEvent } from "@/lib/types/event";
import { MarkdownCopyButton } from "./MarkdownCopyButton";
import { buildReportMarkdown } from "@/lib/report";

// Double-hop dynamic import: @react-pdf/renderer is only loaded client-side,
// avoiding Turbopack SSR chunk tracing of the external module.
const PdfButton = dynamic(() => import("./PdfButton").then((m) => m.PdfButton), {
  ssr: false,
  loading: () => (
    <button className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium text-foreground opacity-70">
      <FileText className="h-3.5 w-3.5" /> Export PDF…
    </button>
  ),
});

export function ReportExport({
  project,
  knowledge,
  events,
}: {
  project: Project;
  knowledge: KnowledgeItem[];
  events: TimelineEvent[];
}) {
  const md = buildReportMarkdown(project, knowledge, events);

  return (
    <div className="flex items-center gap-2">
      <PdfButton project={project} knowledge={knowledge} events={events} />
      <MarkdownCopyButton
        content={md}
        label="Copy report"
        variant="outline"
        className="h-8"
      />
      <span className="hidden text-[11px] text-muted-foreground xl:inline">
        <FileText className="mr-1 inline h-3 w-3" />
        Summary + Knowledge + Timeline + CIF breakdown
      </span>
    </div>
  );
}
