import type { StateCreator } from "zustand";
import type { ViewportState, ZoomTier } from "@/types";

export interface MapSlice {
  viewport: ViewportState;
  zoomTier: ZoomTier;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setZoomTier: (tier: ZoomTier) => void;
}

function getZoomTier(zoom: number): ZoomTier {
  if (zoom < 9.5) return "strategic";
  if (zoom < 12) return "operational";
  return "tactical";
}

export const createMapSlice: StateCreator<MapSlice> = (set) => ({
  viewport: {
    longitude: 5.95,
    latitude: 50.15,
    zoom: 9,
    bearing: 0,
    pitch: 0,
  },
  zoomTier: "strategic",
  setViewport: (partial) =>
    set((state) => {
      const newViewport = { ...state.viewport, ...partial };
      return {
        viewport: newViewport,
        zoomTier: getZoomTier(newViewport.zoom),
      };
    }),
  setZoomTier: (tier) => set({ zoomTier: tier }),
});
