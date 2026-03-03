export interface ViewportState {
  longitude: number;
  latitude: number;
  zoom: number;
  bearing: number;
  pitch: number;
}

export type ZoomTier = "strategic" | "operational" | "tactical";

export interface ZoomTierConfig {
  tier: ZoomTier;
  minZoom: number;
  maxZoom: number;
  echelons: string[];
}

export interface InterpolatedPosition {
  unitId: string;
  lng: number;
  lat: number;
  progress: number; // 0-1 interpolation progress
}
