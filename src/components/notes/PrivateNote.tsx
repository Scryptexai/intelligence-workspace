"use client";

import { useEffect, useState } from "react";
import { Check, StickyNote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { fetchNote, saveNote } from "@/services/noteService";

/**
 * Private Note — data-source agnostic.
 * mock → MockAdapter (localStorage) · backend → POST /api/notes (DB nanti)
 */
export function PrivateNote({
  slug,
  id,
  title = "Private Note",
}: {
  slug: string;
  id: string;
  title?: string;
}) {
  const [note, setNote] = useState("");
  const [saved, setSaved] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    fetchNote(slug, id)
      .then((text) => {
        if (active) setNote(text);
      })
      .catch(() => {
        /* ignore — fallback kosong */
      })
      .finally(() => {
        if (active) setLoaded(true);
      });
    return () => {
      active = false;
    };
  }, [slug, id]);

  const save = async () => {
    try {
      await saveNote(slug, id, note);
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4">
      <div className="flex items-center gap-2">
        <StickyNote className="h-3.5 w-3.5 text-amber-400" />
        <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {title}
        </span>
        <span className="ml-auto text-[10px] text-muted-foreground">
          private · synced via API
        </span>
      </div>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        placeholder="Add your own analysis note — e.g. 'C-002 menunggu laporan Q3 untuk konfirmasi.'"
        className="mt-2.5 h-20 w-full resize-y rounded-md border border-border bg-card px-3 py-2 text-[12.5px] leading-relaxed text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:ring-1 focus:ring-ring"
      />
      <div className="mt-2 flex items-center justify-between">
        <span className="text-[10.5px] text-muted-foreground/70">
          {loaded ? `${note.length} chars` : "…"}
        </span>
        <Button variant="secondary" size="sm" className="h-7 gap-1.5 text-[11.5px]" onClick={save}>
          {saved ? (
            <>
              <Check className="h-3 w-3 text-success" /> Saved
            </>
          ) : (
            <>
              <StickyNote className="h-3 w-3" /> Save note
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
