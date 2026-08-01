"use client";

import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Project } from "@/lib/types/project";
import type { KnowledgeItem } from "@/lib/types/knowledge";
import type { TimelineEvent } from "@/lib/types/event";
import { formatDate } from "@/lib/utils/helpers";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1e293b",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    borderBottomWidth: 2,
    borderBottomColor: "#0e7490",
    paddingBottom: 10,
    marginBottom: 16,
  },
  title: { fontSize: 20, fontWeight: "bold", color: "#0f172a" },
  subtitle: { fontSize: 9, color: "#64748b", marginTop: 3 },
  score: { fontSize: 26, fontWeight: "bold", color: "#0e7490" },
  scoreLabel: { fontSize: 8, color: "#64748b", textAlign: "right" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0e7490",
    marginTop: 14,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
    paddingBottom: 4,
  },
  summary: { fontSize: 10, lineHeight: 1.6, color: "#334155" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#e2e8f0",
  },
  rowLabel: { color: "#64748b" },
  rowValue: { fontWeight: "bold", color: "#0f172a" },
  kRow: { marginBottom: 6 },
  kId: { fontSize: 9, fontWeight: "bold", color: "#0e7490" },
  kName: { fontSize: 10, fontWeight: "bold", color: "#0f172a" },
  kMeta: { fontSize: 8, color: "#64748b", marginTop: 1 },
  evRow: { marginBottom: 4 },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 36,
    right: 36,
    fontSize: 8,
    color: "#94a3b8",
    textAlign: "center",
    borderTopWidth: 0.5,
    borderTopColor: "#e2e8f0",
    paddingTop: 6,
  },
});

export function ProjectReport({
  project,
  knowledge,
  events,
}: {
  project: Project;
  knowledge: KnowledgeItem[];
  events: TimelineEvent[];
}) {
  const sortedEvents = [...events].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);
  return (
    <Document
      title={`${project.name} CIF Report`}
      author="Intelligence Workspace"
      subject={`Crypto Intelligence Framework report — ${project.name}`}
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>{project.name} ({project.symbol})</Text>
            <Text style={styles.subtitle}>
              {project.tagline} · {project.status.toUpperCase()} · Generated {new Date().toISOString().slice(0, 10)}
            </Text>
          </View>
          <View>
            <Text style={styles.score}>{project.cifScore}</Text>
            <Text style={styles.scoreLabel}>CIF SCORE</Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.summary}>{project.description}</Text>

        <Text style={styles.sectionTitle}>Key Metrics</Text>
        {(
          [
            ["Confidence", `${project.confidence}%`],
            ["Knowledge items", String(project.knowledgeCount)],
            ["Conflicts", String(project.conflictCount)],
            ["Coverage", `${project.coverage}%`],
            ["Entities tracked", String(project.entityCount)],
            ["Events logged", String(project.eventCount)],
          ] as const
        ).map(([label, value]) => (
          <View key={label} style={styles.row}>
            <Text style={styles.rowLabel}>{label}</Text>
            <Text style={styles.rowValue}>{value}</Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>CIF Dimension Breakdown</Text>
        {project.qa.dimensions.map((d) => (
          <View key={d.key} style={styles.row}>
            <Text style={styles.rowLabel}>
              {d.label} — {d.description}
            </Text>
            <Text style={styles.rowValue}>
              {d.score}/100 × {d.weight}% = {Math.round(d.score * d.weight) / 100}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Key Knowledge</Text>
        {knowledge.slice(0, 6).map((k) => (
          <View key={k.id} style={styles.kRow}>
            <Text style={styles.kName}>
              <Text style={styles.kId}>{k.id}</Text> {k.name}
            </Text>
            <Text style={styles.kMeta}>
              {k.confidence}% confidence · {k.status} · {k.evidence.length} evidence traces · updated {formatDate(k.updatedAt)}
            </Text>
          </View>
        ))}

        <Text style={styles.sectionTitle}>Recent Timeline</Text>
        {sortedEvents.map((ev) => (
          <View key={ev.id} style={styles.evRow}>
            <Text style={styles.rowValue}>
              {formatDate(ev.date)} — {ev.name} <Text style={styles.rowLabel}>({ev.type})</Text>
            </Text>
          </View>
        ))}

        <Text style={styles.footer}>
          Generated by Intelligence Workspace · Crypto Intelligence Framework v1.0 · {project.name} ({project.symbol})
        </Text>
      </Page>
    </Document>
  );
}
