"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import type { LineLayerSpecification } from "maplibre-gl";

const defensiveLineLayer: LineLayerSpecification = {
  id: "fortification-defensive-line",
  type: "line",
  source: "fortifications",
  filter: ["==", ["get", "type"], "defensive_line"],
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "side"], "allied"],
      "#2563eb",
      "#dc2626",
    ],
    "line-width": 3.5,
    "line-opacity": 0.7,
    "line-dasharray": [8, 4],
  },
};

const antiTankLine: LineLayerSpecification = {
  id: "fortification-anti-tank",
  type: "line",
  source: "fortifications",
  filter: ["==", ["get", "type"], "anti_tank"],
  paint: {
    "line-color": "#dc2626",
    "line-width": 4,
    "line-opacity": 0.5,
    "line-dasharray": [3, 3],
  },
};

// Wider invisible hit area for easier mouse targeting
const hitArea: LineLayerSpecification = {
  id: "fortification-hit-area",
  type: "line",
  source: "fortifications",
  paint: {
    "line-color": "transparent",
    "line-width": 20,
    "line-opacity": 0,
  },
};

interface PopupInfo {
  lng: number;
  lat: number;
  name: string;
  type: string;
  side: string;
}

const FORTIFICATION_LABELS: Record<string, string> = {
  defensive_line: "Defensive Line",
  anti_tank: "Anti-Tank Obstacle",
};

const INTERACTIVE_LAYERS = [
  "fortification-defensive-line",
  "fortification-anti-tank",
  "fortification-hit-area",
];

export function FortificationLayer() {
  const fortifications = useStore((s) => s.fortifications);
  const { current: mapRef } = useMap();
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const hoveredIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!mapRef) return;
      const map = mapRef.getMap();

      const features = map.queryRenderedFeatures(e.point, {
        layers: INTERACTIVE_LAYERS,
      });

      if (features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        const feature = features[0];
        const fid = feature.id as number | undefined;

        if (hoveredIdRef.current !== null && hoveredIdRef.current !== fid) {
          map.setFeatureState(
            { source: "fortifications", id: hoveredIdRef.current },
            { hover: false }
          );
        }
        if (fid !== undefined) {
          map.setFeatureState(
            { source: "fortifications", id: fid },
            { hover: true }
          );
          hoveredIdRef.current = fid;
        }

        setPopupInfo({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
          name: feature.properties?.name ?? "Unknown",
          type: feature.properties?.type ?? "",
          side: feature.properties?.side ?? "",
        });
      } else {
        map.getCanvas().style.cursor = "";
        if (hoveredIdRef.current !== null) {
          map.setFeatureState(
            { source: "fortifications", id: hoveredIdRef.current },
            { hover: false }
          );
          hoveredIdRef.current = null;
        }
        setPopupInfo(null);
      }
    },
    [mapRef]
  );

  const handleMouseLeave = useCallback(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();
    map.getCanvas().style.cursor = "";
    if (hoveredIdRef.current !== null) {
      map.setFeatureState(
        { source: "fortifications", id: hoveredIdRef.current },
        { hover: false }
      );
      hoveredIdRef.current = null;
    }
    setPopupInfo(null);
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();

    map.on("mousemove", handleMouseMove);
    map.on("mouseleave", handleMouseLeave);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("mouseleave", handleMouseLeave);
    };
  }, [mapRef, handleMouseMove, handleMouseLeave]);

  if (!fortifications) return null;

  // Add numeric IDs for feature-state support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src = fortifications as any;
  const fortificationsWithIds = {
    type: "FeatureCollection" as const,
    features: src.features.map((f: Record<string, unknown>, i: number) => ({
      ...f,
      id: i,
    })),
  };

  return (
    <Source id="fortifications" type="geojson" data={fortificationsWithIds}>
      <Layer {...hitArea} />
      <Layer
        id="fortification-defensive-line-glow"
        type="line"
        source="fortifications"
        filter={["==", ["get", "type"], "defensive_line"]}
        paint={{
          "line-color": [
            "case",
            ["==", ["get", "side"], "allied"],
            "#60a5fa",
            "#f87171",
          ],
          "line-width": 8,
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.4,
            0,
          ],
        }}
      />
      <Layer {...defensiveLineLayer} />
      <Layer
        id="fortification-anti-tank-glow"
        type="line"
        source="fortifications"
        filter={["==", ["get", "type"], "anti_tank"]}
        paint={{
          "line-color": "#f87171",
          "line-width": 8,
          "line-opacity": [
            "case",
            ["boolean", ["feature-state", "hover"], false],
            0.3,
            0,
          ],
        }}
      />
      <Layer {...antiTankLine} />

      {popupInfo && (
        <Popup
          longitude={popupInfo.lng}
          latitude={popupInfo.lat}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={12}
          className="fortification-popup"
        >
          <div className="px-2 py-1.5 w95-font">
            <div className="font-bold text-[11px] text-black">
              {popupInfo.name}
            </div>
            <div className="text-[10px] text-[#404040] mt-0.5 flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2"
                style={{
                  backgroundColor:
                    popupInfo.side === "allied" ? "#000080" : "#cc0000",
                }}
              />
              {popupInfo.side === "allied" ? "Allied" : "Axis"}{" "}
              {FORTIFICATION_LABELS[popupInfo.type] ?? popupInfo.type}
            </div>
          </div>
        </Popup>
      )}
    </Source>
  );
}
