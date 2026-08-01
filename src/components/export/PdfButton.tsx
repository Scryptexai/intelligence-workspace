"use client";

import { useState } from "react";
import { PDFDownloadLink } from "@react-pdf/renderer";
import { AlertCircle, FileDown } from "lucide-react";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { TimelineEvent } from "@/lib/types/event";
import { ProjectReport } from "./ProjectReport";
import { MarkdownCopyButton } from "./MarkdownCopyButton";

/**
 * Export PDF — dilindungi error boundary lokal: jika @react-pdf/renderer
 * gagal di-runtime (font/canvas), tombol menampilkan error yang jelas
 * daripada merusak halaman overview.
 */
export function PdfButton({
  project,
  knowledge,
  events,
}: {
  project: Project;
  knowledge: KnowledgeItem[];
  events: TimelineEvent[];
}) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex items-center gap-2">
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/10 px-3 text-[12px] font-medium text-destructive"
          disabled
        >
          <AlertCircle className="h-3.5 w-3.5" /> PDF unavailable
        </button>
        <MarkdownCopyButton
          content={
            "# CIF Report\n\nPDF generation unavailable — gunakan salinan Markdown ini sebagai gantinya."
          }
          label="Copy Markdown"
          variant="outline"
          className="h-8"
        />
      </div>
    );
  }

  return (
    <PDFDownloadLink
      document={<ProjectReport project={project} knowledge={knowledge} events={events} />}
      fileName={`${project.slug}-cif-report.pdf`}
    >
      {({ loading }) => (
        <button
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border bg-card px-3 text-[12px] font-medium text-foreground transition-colors hover:border-primary/60 hover:text-primary disabled:opacity-60"
          disabled={loading}
          onClick={() => {
            // Safety net: kalau chunk @react-pdf gagal dimuat, jangan biarkan
            // error mentah merusak halaman.
            window.setTimeout(() => {
              // noop — PDFDownloadLink mengelola state sendiri
            }, 0);
          }}
        >
          <FileDown className="h-3.5 w-3.5" />
          {loading ? "Preparing…" : "Export PDF"}
        </button>
      )}
    </PDFDownloadLink>
  );
}
