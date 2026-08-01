import type { SearchResult } from "@/lib/data";

export interface Facet {
  key: string;
  op: ":" | ">" | "<" | ">=" | "<=";
  value: string;
  numeric: boolean;
}

export interface ParsedQuery {
  text: string;
  facets: Facet[];
}

const FACET_KEYS = new Set([
  "type",
  "status",
  "severity",
  "confidence",
  "category",
  "entity",
  "event",
  "conflict",
  "project",
]);

/**
 * Parses "type:knowledge confidence:>90 status:stable tokenomics"
 * into free-text + facet tokens.
 */
export function parseSearchQuery(raw: string): ParsedQuery {
  const tokens = raw.trim().split(/\s+/).filter(Boolean);
  const facets: Facet[] = [];
  const textParts: string[] = [];

  for (const t of tokens) {
    const m = t.match(/^([a-z]+)(>=|<=|>|<|:)(.+)$/i);
    if (m && FACET_KEYS.has(m[1].toLowerCase())) {
      const key = m[1].toLowerCase();
      const op = m[2] as Facet["op"];
      const value = m[3];
      facets.push({
        key,
        op,
        value,
        numeric: key === "confidence" && !isNaN(Number(value)),
      });
    } else {
      textParts.push(t);
    }
  }
  return { text: textParts.join(" "), facets };
}

export function matchesFacets(r: SearchResult, facets: Facet[]): boolean {
  return facets.every((f) => {
    switch (f.key) {
      case "type":
        return r.category.toLowerCase() === f.value.toLowerCase();
      case "status":
        return (r.status ?? "").toLowerCase() === f.value.toLowerCase();
      case "severity":
        return (r.severity ?? "").toLowerCase() === f.value.toLowerCase();
      case "confidence": {
        if (r.confidence === undefined) return false;
        const v = Number(f.value);
        if (isNaN(v)) return true;
        if (f.op === ">") return r.confidence > v;
        if (f.op === "<") return r.confidence < v;
        if (f.op === ">=") return r.confidence >= v;
        if (f.op === "<=") return r.confidence <= v;
        return r.confidence === v;
      }
      case "category":
        return (r.domain ?? "").toLowerCase().includes(f.value.toLowerCase());
      case "entity":
        return r.category === "Entity" && r.label.toLowerCase().includes(f.value.toLowerCase());
      case "event":
        return r.category === "Event" && r.label.toLowerCase().includes(f.value.toLowerCase());
      case "conflict":
        return r.category === "Conflict" && r.label.toLowerCase().includes(f.value.toLowerCase());
      case "project":
        return r.category === "Project" && r.label.toLowerCase().includes(f.value.toLowerCase());
      default:
        return true;
    }
  });
}

export function facetDisplay(f: Facet): string {
  return `${f.key}${f.op}${f.value}`;
}
