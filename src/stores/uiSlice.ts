import type { StateCreator } from "zustand";

export interface UISlice {
  isLegendOpen: boolean;
  isEventBannerVisible: boolean;
  toggleLegend: () => void;
  setLegendOpen: (open: boolean) => void;
  setEventBannerVisible: (visible: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isLegendOpen: false,
  isEventBannerVisible: true,
  toggleLegend: () => set((state) => ({ isLegendOpen: !state.isLegendOpen })),
  setLegendOpen: (open) => set({ isLegendOpen: open }),
  setEventBannerVisible: (visible) => set({ isEventBannerVisible: visible }),
});
