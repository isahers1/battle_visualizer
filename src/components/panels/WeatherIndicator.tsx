"use client";

import { useEffect, useRef, useState } from "react";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import { useStore } from "@/stores";
import type { Visibility } from "@/types/weather";

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

const VISIBILITY_CONFIG: Record<Visibility, { label: string; color: string; note: string }> = {
  very_low: { label: "Very Low", color: "#cc0000", note: "No air support possible" },
  low: { label: "Low", color: "#cc6600", note: "Limited air operations" },
  moderate: { label: "Moderate", color: "#808000", note: "Partial air support" },
  high: { label: "High", color: "#008000", note: "Full air superiority" },
};

export function WeatherIndicator() {
  const snapshot = useCurrentSnapshot();
  const currentStep = useStore((s) => s.currentStep);
  const timeline = useStore((s) => s.timeline);
  const [isFlashing, setIsFlashing] = useState(false);
  const prevVisibilityRef = useRef<Visibility | null>(null);

  // Flash when visibility dramatically improves
  useEffect(() => {
    if (!snapshot) return;
    const currentVis = snapshot.weather.visibility;
    const prevVis = prevVisibilityRef.current;
    prevVisibilityRef.current = currentVis;

    if (prevVis && prevVis === "very_low" && (currentVis === "high" || currentVis === "moderate")) {
      setIsFlashing(true);
      const timer = setTimeout(() => setIsFlashing(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [currentStep, snapshot]);

  if (!snapshot) return null;

  const visConfig = VISIBILITY_CONFIG[snapshot.weather.visibility];

  return (
    <div
      className="w95-raised w95-font p-0 transition-all"
      style={isFlashing ? {
        boxShadow: "0 0 12px 4px rgba(255, 215, 0, 0.6), inset 1px 1px 0 var(--w95-highlight), inset -1px -1px 0 var(--w95-shadow)",
      } : {}}
    >
      <div className="w95-titlebar text-[10px]">
        <span className="mr-1">{WEATHER_ICONS[snapshot.weather.condition] ?? "\u2601"}</span>
        Weather
      </div>
      <div className="px-2 py-1.5">
        <div className="flex items-center gap-2">
          <span className="text-[16px]">
            {WEATHER_ICONS[snapshot.weather.condition] ?? "\u2601"}
          </span>
          <div>
            <div className="text-[11px] font-bold text-black">
              {WEATHER_LABELS[snapshot.weather.condition] ?? snapshot.weather.condition}
            </div>
            <div className="text-[10px] text-[#404040]">{snapshot.weather.temperature}&deg;C</div>
          </div>
        </div>
        {visConfig && (
          <div className="mt-1.5 pt-1.5 border-t border-[#a0a0a0]">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-[#404040]">Visibility:</span>
              <span
                className="text-[10px] font-bold px-1"
                style={{ color: visConfig.color }}
              >
                {visConfig.label}
              </span>
            </div>
            <div className="text-[9px] text-[#606060] mt-0.5 italic">
              {visConfig.note}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
