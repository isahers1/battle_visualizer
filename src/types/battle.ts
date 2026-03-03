import type { Unit } from "./unit";
import type { TimelineSnapshot } from "./timeline";

export interface Belligerent {
  side: "allied" | "axis";
  name: string;
  color: string;
}

export interface BattleBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface BattleOverviewPhase {
  heading: string;
  body: string;
}

export interface BattleOverviewCasualties {
  allied: string;
  axis: string;
  note?: string;
}

export interface BattleOverview {
  context: string;
  germanPlan: string;
  keyPhases: BattleOverviewPhase[];
  outcome: string;
  casualties: BattleOverviewCasualties;
  legacy: string;
}

export interface BattleMetadata {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  bounds: BattleBounds;
  center: [number, number]; // [lng, lat]
  defaultZoom: number;
  belligerents: Belligerent[];
  overview?: BattleOverview;
}

export interface BattleData {
  metadata: BattleMetadata;
  units: Record<string, Unit>;
  timeline: TimelineSnapshot[];
  terrain: GeoJSON.FeatureCollection;
  fortifications: GeoJSON.FeatureCollection;
}
