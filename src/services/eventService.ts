import { eventRepository } from "@/lib/api/repositories";
import type { TimelineEvent } from "@/lib/types/event";

export function fetchEvents(slug: string): Promise<TimelineEvent[]> {
  return eventRepository.list(slug);
}
