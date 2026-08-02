/**
 * Notes API — persisten via Supabase (tabel `notes`) saat REST aktif,
 * fallback in-memory server (hilang saat restart) jika tidak.
 * Kontrak: GET ?scope=&id= → { data: string, meta } · POST { scope, id, text } → 204
 */

import { supabaseRest, supabaseRestEnabled } from "@/db/supabaseService";
import { apiJson, apiError } from "@/lib/api/response";

/** Fallback in-memory (hanya dipakai bila Supabase REST tidak aktif). */
const store = new Map<string, string>();

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const scope = searchParams.get("scope") ?? "";
  const id = searchParams.get("id") ?? "";
  if (supabaseRestEnabled) {
    const text = await supabaseRest.getNote(scope, id);
    return apiJson(text, { source: "supabase-rest" });
  }
  return apiJson(store.get(`${scope}:${id}`) ?? "", { source: "mock" });
}

export async function POST(req: Request) {
  const body = (await req.json()) as { scope?: string; id?: string; text?: string };
  if (!body.scope || !body.id) {
    return apiError("scope and id required", 400);
  }
  if (supabaseRestEnabled) {
    await supabaseRest.saveNote(body.scope, body.id, body.text ?? "");
    return new Response(null, { status: 204 });
  }
  if (body.text?.trim()) store.set(`${body.scope}:${body.id}`, body.text);
  else store.delete(`${body.scope}:${body.id}`);
  return new Response(null, { status: 204 });
}
