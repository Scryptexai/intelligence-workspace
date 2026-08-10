import { create } from "zustand";

export type Density = "comfortable" | "compact";
/** Mode tampilan: density (Bloomberg) / canvas (Obsidian) / comfortable. */
export type ViewMode = "density" | "canvas" | "comfortable";

interface UIState {
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  density: Density;
  viewMode: ViewMode;
  explorerOpen: boolean;
  inspectorOpen: boolean;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setDensity: (d: Density) => void;
  setViewMode: (m: ViewMode) => void;
  toggleExplorer: () => void;
  toggleInspector: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  searchOpen: false,
  density: "comfortable",
  viewMode: "comfortable",
  // Chronicle menjadi navigasi utama; pengguna tetap dapat menutupnya via toolbar.
  explorerOpen: true,
  inspectorOpen: false,
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setDensity: (density) => set({ density }),
  setViewMode: (viewMode) =>
    set({
      viewMode,
      density: viewMode === "density" ? "compact" : "comfortable",
    }),
  toggleExplorer: () => set((s) => ({ explorerOpen: !s.explorerOpen })),
  toggleInspector: () => set((s) => ({ inspectorOpen: !s.inspectorOpen })),
}));
