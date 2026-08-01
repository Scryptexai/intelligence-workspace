import { noteRepository } from "@/lib/api/repositories";

export function fetchNote(scope: string, id: string): Promise<string> {
  return noteRepository.get(scope, id);
}

export function saveNote(scope: string, id: string, text: string): Promise<void> {
  return noteRepository.save(scope, id, text);
}
