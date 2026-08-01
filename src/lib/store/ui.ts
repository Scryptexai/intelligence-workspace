import { create } from "zustand";

export type Density = "comfortable" | "compact";

interface UIState {
  sidebarCollapsed: boolean;
  searchOpen: boolean;
  density: Density;
  toggleSidebar: () => void;
  setSearchOpen: (open: boolean) => void;
  setDensity: (d: Density) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarCollapsed: false,
  searchOpen: false,
  density: "comfortable",
  toggleSidebar: () =>
    set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  setSearchOpen: (open) => set({ searchOpen: open }),
  setDensity: (density) => set({ density }),
}));
