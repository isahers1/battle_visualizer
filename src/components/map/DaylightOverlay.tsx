"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { useDaylightState } from "@/hooks/useDaylightState";
import type { FillLayerSpecification } from "maplibre-gl";

export function DaylightOverlay() {
  const metadata = useStore((s) => s.metadata);
  const daylightState = useDaylightState();

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

  const layerStyle: FillLayerSpecification = useMemo(
    () => ({
      id: "daylight-overlay",
      type: "fill",
      source: "daylight-overlay",
      paint: {
        "fill-color": daylightState?.tintColor ?? "rgba(0,0,0,0)",
        "fill-opacity": daylightState?.opacity ?? 0,
      },
    }),
    [daylightState]
  );

  if (!overlayGeojson || !daylightState || daylightState.opacity === 0)
    return null;

  return (
    <Source id="daylight-overlay" type="geojson" data={overlayGeojson}>
      <Layer {...layerStyle} />
    </Source>
  );
}
