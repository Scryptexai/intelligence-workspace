import { create } from "zustand";
import type { EntityType } from "@/lib/types/entity";

export type GraphLayoutMode = "radial" | "hierarchical" | "force";

interface GraphState {
  selectedId: string | null;
  focusedId: string | null;
  hopLevel: number;
  layoutMode: GraphLayoutMode;
  locked: boolean;
  typeFilter: EntityType | "All";
  searchQuery: string;
  setSelectedId: (id: string | null) => void;
  setFocused: (id: string, hops?: number) => void;
  clearFocus: () => void;
  setLayoutMode: (m: GraphLayoutMode) => void;
  toggleLock: () => void;
  setTypeFilter: (t: EntityType | "All") => void;
  setSearchQuery: (q: string) => void;
}

export const useGraphStore = create<GraphState>((set) => ({
  selectedId: null,
  focusedId: null,
  hopLevel: 2,
  layoutMode: "radial",
  locked: false,
  typeFilter: "All",
  searchQuery: "",
  setSelectedId: (selectedId) => set({ selectedId }),
  setFocused: (focusedId, hopLevel) => set({ focusedId, hopLevel: hopLevel ?? 2 }),
  clearFocus: () => set({ focusedId: null }),
  setLayoutMode: (layoutMode) => set({ layoutMode }),
  toggleLock: () => set((s) => ({ locked: !s.locked })),
  setTypeFilter: (typeFilter) => set({ typeFilter }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
}));
