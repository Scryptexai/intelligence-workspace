import { qaRepository, behaviorRepository } from "@/lib/api/repositories";
import type { QAReport, BehaviorProfile } from "@/lib/types/project";

export function fetchQa(slug: string): Promise<QAReport | undefined> {
  return qaRepository.get(slug);
}

export function fetchBehavior(slug: string): Promise<BehaviorProfile | undefined> {
  return behaviorRepository.get(slug);
}
