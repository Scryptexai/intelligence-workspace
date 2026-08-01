/**
 * Mock notes API — penyimpanan in-memory server (hilang saat restart).
 * Backend sungguhan: ganti dengan query PostgreSQL (tabel notes).
 * Kontrak: GET ?scope=&id= → { data: string, meta } · POST { scope, id, text } → 204
 */

import { apiJson, apiError } from "@/lib/api/response";

type NoteKey = string;
const store = new Map<NoteKey, string>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "";
  const id = searchParams.get("id") ?? "";
  return apiJson(store.get(`${scope}:${id}`) ?? "");
}

export async function POST(req: Request) {
  const body = (await req.json()) as { scope?: string; id?: string; text?: string };
  if (!body.scope || !body.id) {
    return apiError("scope and id required", 400);
  }
  if (body.text?.trim()) store.set(`${body.scope}:${body.id}`, body.text);
  else store.delete(`${body.scope}:${body.id}`);
  return new Response(null, { status: 204 });
}
