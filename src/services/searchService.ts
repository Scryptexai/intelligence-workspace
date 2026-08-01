import { searchRepository } from "@/lib/api/repositories";
import type { SearchResult } from "@/lib/data";

export function searchAll(q: string): Promise<SearchResult[]> {
  return searchRepository.query(q);
}
