import { knowledgeRepository } from "@/lib/api/repositories";
import type { KnowledgeItem } from "@/lib/types/knowledge";

export async function fetchKnowledge(slug: string): Promise<KnowledgeItem[]> {
  return knowledgeRepository.list(slug);
}

export async function fetchKnowledgeItem(
  slug: string,
  id: string
): Promise<KnowledgeItem | undefined> {
  return knowledgeRepository.get(slug, id);
}
