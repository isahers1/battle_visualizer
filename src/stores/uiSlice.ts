import type { StateCreator } from "zustand";

export interface UISlice {
  isLegendOpen: boolean;
  isEventBannerVisible: boolean;
  isCameraFollowEnabled: boolean;
  isPresentationMode: boolean;
  isSitRepOpen: boolean;
  toggleLegend: () => void;
  setLegendOpen: (open: boolean) => void;
  setEventBannerVisible: (visible: boolean) => void;
  toggleCameraFollow: () => void;
  setCameraFollow: (enabled: boolean) => void;
  setPresentationMode: (active: boolean) => void;
  setSitRepOpen: (open: boolean) => void;
}

export const createUISlice: StateCreator<UISlice> = (set) => ({
  isLegendOpen: false,
  isEventBannerVisible: true,
  isCameraFollowEnabled: true,
  isPresentationMode: false,
  isSitRepOpen: false,
  toggleLegend: () => set((state) => ({ isLegendOpen: !state.isLegendOpen })),
  setLegendOpen: (open) => set({ isLegendOpen: open }),
  setEventBannerVisible: (visible) => set({ isEventBannerVisible: visible }),
  toggleCameraFollow: () => set((state) => ({ isCameraFollowEnabled: !state.isCameraFollowEnabled })),
  setCameraFollow: (enabled) => set({ isCameraFollowEnabled: enabled }),
  setPresentationMode: (active) => set({ isPresentationMode: active }),
  setSitRepOpen: (open) => set({ isSitRepOpen: open }),
});
