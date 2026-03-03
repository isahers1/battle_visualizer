import type { StateCreator } from "zustand";
import type { BattleMetadata, Unit, TimelineSnapshot } from "@/types";

export interface BattleSlice {
  metadata: BattleMetadata | null;
  units: Record<string, Unit>;
  timeline: TimelineSnapshot[];
  terrain: GeoJSON.FeatureCollection | null;
  fortifications: GeoJSON.FeatureCollection | null;
  isLoaded: boolean;
  setBattleData: (data: {
    metadata: BattleMetadata;
    units: Record<string, Unit>;
    timeline: TimelineSnapshot[];
    terrain: GeoJSON.FeatureCollection;
    fortifications: GeoJSON.FeatureCollection;
  }) => void;
  clearBattleData: () => void;
}

export const createBattleSlice: StateCreator<BattleSlice> = (set) => ({
  metadata: null,
  units: {},
  timeline: [],
  terrain: null,
  fortifications: null,
  isLoaded: false,
  setBattleData: (data) =>
    set({
      metadata: data.metadata,
      units: data.units,
      timeline: data.timeline,
      terrain: data.terrain,
      fortifications: data.fortifications,
      isLoaded: true,
    }),
  clearBattleData: () =>
    set({
      metadata: null,
      units: {},
      timeline: [],
      terrain: null,
      fortifications: null,
      isLoaded: false,
    }),
});
