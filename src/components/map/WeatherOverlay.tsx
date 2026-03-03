"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import { WEATHER_CONFIGS } from "@/lib/weatherEffects";
import type { FillLayerSpecification } from "maplibre-gl";

export function WeatherOverlay() {
  const metadata = useStore((s) => s.metadata);
  const snapshot = useCurrentSnapshot();

  const overlayGeojson = useMemo(() => {
    if (!metadata) return null;
    const b = metadata.bounds;
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "Polygon" as const,
            coordinates: [
              [
                [b.west - 1, b.south - 1],
                [b.east + 1, b.south - 1],
                [b.east + 1, b.north + 1],
                [b.west - 1, b.north + 1],
                [b.west - 1, b.south - 1],
              ],
            ],
          },
        },
      ],
    };
  }, [metadata]);

  const weatherConfig = snapshot
    ? WEATHER_CONFIGS[snapshot.weather.condition]
    : null;

  const layerStyle: FillLayerSpecification = useMemo(
    () => ({
      id: "weather-overlay",
      type: "fill",
      source: "weather-overlay",
      paint: {
        "fill-color": weatherConfig?.color ?? "rgba(0,0,0,0)",
        "fill-opacity": weatherConfig?.opacity ?? 0,
      },
    }),
    [weatherConfig]
  );

  if (!overlayGeojson || !weatherConfig || weatherConfig.opacity === 0)
    return null;

  return (
    <Source id="weather-overlay" type="geojson" data={overlayGeojson}>
      <Layer {...layerStyle} />
    </Source>
  );
}
