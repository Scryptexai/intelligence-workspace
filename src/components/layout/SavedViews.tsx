"use client";

import { useCallback, useEffect, useState } from "react";
import { Bookmark, BookmarkCheck, Plus, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { viewRepository } from "@/lib/api/repositories";
import type { SavedView } from "@/lib/types/view";

export type { SavedView };

/**
 * Saved Views — data-source agnostic.
 * mock → MockAdapter (localStorage) · backend → GET/POST /api/views (DB nanti)
 */
export function SavedViews({
  scope,
  filters,
  onApply,
}: {
  scope: string;
  filters: Record<string, string>;
  onApply: (f: Record<string, string>) => void;
}) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");

  useEffect(() => {
    let active = true;
    viewRepository
      .list(scope)
      .then((items) => {
        if (active) setViews(items);
      })
      .catch(() => {
        /* ignore */
      });
    return () => {
      active = false;
    };
  }, [scope]);

  const refresh = useCallback(async () => {
    const items = await viewRepository.list(scope);
    setViews(items);
  }, [scope]);

  const save = async () => {
    if (!name.trim()) return;
    const v: SavedView = {
      id: `v-${Date.now()}`,
      name: name.trim(),
      scope,
      filters,
    };
    await viewRepository.save(v);
    await refresh();
    setNaming(false);
    setName("");
  };

  const remove = async (id: string) => {
    await viewRepository.remove(id, scope);
    await refresh();
  };

  const activeView = views.find((v) =>
    Object.entries(v.filters).every(([k, val]) => filters[k] === val)
  );

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[12px]">
            {activeView ? (
              <BookmarkCheck className="h-3.5 w-3.5 text-primary" />
            ) : (
              <Bookmark className="h-3.5 w-3.5" />
            )}
            Views{activeView ? ` · ${activeView.name}` : ""}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>Saved views ({scope})</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {views.length === 0 && (
            <div className="px-2 py-3 text-center text-[11.5px] text-muted-foreground">
              No saved views yet.
            </div>
          )}
          {views.map((v) => (
            <DropdownMenuItem key={v.id} className="justify-between" onSelect={() => onApply(v.filters)}>
              <span className="truncate">{v.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  void remove(v.id);
                }}
                className="rounded p-0.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </DropdownMenuItem>
          ))}
          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setNaming(true)}>
            <Plus className="h-3.5 w-3.5" /> Save current filter as view…
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={naming} onOpenChange={setNaming}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Save view</DialogTitle>
            <DialogDescription>
              Name this filter combination so your team can reuse it.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="view-name">View name</Label>
            <Input
              id="view-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. High Impact Conflicts"
              onKeyDown={(e) => e.key === "Enter" && void save()}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" size="sm" onClick={() => setNaming(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={() => void save()} disabled={!name.trim()}>
              Save view
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
