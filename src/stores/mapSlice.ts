import type { StateCreator } from "zustand";
import type { ViewportState, ZoomTier } from "@/types";

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapSlice {
  viewport: ViewportState;
  zoomTier: ZoomTier;
  viewportBounds: ViewportBounds | null;
  setViewport: (viewport: Partial<ViewportState>) => void;
  setZoomTier: (tier: ZoomTier) => void;
  setViewportBounds: (bounds: ViewportBounds) => void;
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
  viewportBounds: null,
  setViewport: (partial) =>
    set((state) => {
      const newViewport = { ...state.viewport, ...partial };
      return {
        viewport: newViewport,
        zoomTier: getZoomTier(newViewport.zoom),
      };
    }),
  setZoomTier: (tier) => set({ zoomTier: tier }),
  setViewportBounds: (bounds) => set({ viewportBounds: bounds }),
});
