import type { WeatherType } from "@/types";

export interface WeatherOverlayConfig {
  color: string;
  opacity: number;
}

export const WEATHER_CONFIGS: Record<WeatherType, WeatherOverlayConfig> = {
  clear: { color: "rgba(0, 0, 0, 0)", opacity: 0 },
  overcast: { color: "rgba(140, 145, 155, 1)", opacity: 0.04 },
  rain: { color: "rgba(70, 90, 120, 1)", opacity: 0.05 },
  snow: { color: "rgba(220, 225, 235, 1)", opacity: 0.05 },
  fog: { color: "rgba(200, 205, 215, 1)", opacity: 0.06 },
  heavy_snow: { color: "rgba(230, 235, 245, 1)", opacity: 0.08 },
  freezing_rain: { color: "rgba(100, 120, 150, 1)", opacity: 0.05 },
};
