"use client";

import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

const WEATHER_LABELS: Record<string, string> = {
  clear: "Clear",
  overcast: "Overcast",
  rain: "Rain",
  snow: "Snow",
  fog: "Fog",
  heavy_snow: "Heavy Snow",
  freezing_rain: "Freezing Rain",
};

const WEATHER_ICONS: Record<string, string> = {
  clear: "\u2600",
  overcast: "\u2601",
  rain: "\u2602",
  snow: "\u2744",
  fog: "\u2591",
  heavy_snow: "\u2744",
  freezing_rain: "\u2602",
};

export function WeatherIndicator() {
  const snapshot = useCurrentSnapshot();

  if (!snapshot) return null;

  return (
    <div className="w95-raised w95-font p-0">
      <div className="w95-titlebar text-[10px]">
        <span className="mr-1">{WEATHER_ICONS[snapshot.weather.condition] ?? "\u2601"}</span>
        Weather
      </div>
      <div className="px-2 py-1.5 flex items-center gap-2">
        <span className="text-[16px]">
          {WEATHER_ICONS[snapshot.weather.condition] ?? "\u2601"}
        </span>
        <div>
          <div className="text-[11px] font-bold text-black">
            {WEATHER_LABELS[snapshot.weather.condition] ?? snapshot.weather.condition}
          </div>
          <div className="text-[10px] text-[#404040]">{snapshot.weather.temperature}°C</div>
        </div>
      </div>
    </div>
  );
}
