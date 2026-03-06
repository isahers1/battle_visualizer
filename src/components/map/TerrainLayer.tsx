"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import type {
  FillLayerSpecification,
  LineLayerSpecification,
  CircleLayerSpecification,
  SymbolLayerSpecification,
} from "maplibre-gl";

const forestFill: FillLayerSpecification = {
  id: "terrain-forest-fill",
  type: "fill",
  source: "terrain",
  filter: ["==", ["get", "type"], "forest"],
  paint: {
    "fill-color": "#3a7d32",
    "fill-opacity": 0.15,
  },
};

const hillFill: FillLayerSpecification = {
  id: "terrain-hill-fill",
  type: "fill",
  source: "terrain",
  filter: ["==", ["get", "type"], "hill"],
  paint: {
    "fill-color": "#a07d3a",
    "fill-opacity": 0.18,
  },
};

const hillOutline: LineLayerSpecification = {
  id: "terrain-hill-outline",
  type: "line",
  source: "terrain",
  filter: ["==", ["get", "type"], "hill"],
  paint: {
    "line-color": "#8B7355",
    "line-width": 1.5,
    "line-opacity": 0.4,
  },
};

const hillLabel: SymbolLayerSpecification = {
  id: "terrain-hill-label",
  type: "symbol",
  source: "terrain",
  filter: ["==", ["get", "type"], "hill"],
  layout: {
    "text-field": ["get", "name"],
    "text-size": 11,
    "text-font": ["Open Sans Regular"],
    "text-offset": [0, 0],
    "text-allow-overlap": false,
  },
  paint: {
    "text-color": "#6B5B3A",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.5,
  },
};

const riverLine: LineLayerSpecification = {
  id: "terrain-river",
  type: "line",
  source: "terrain",
  filter: ["==", ["get", "type"], "river"],
  paint: {
    "line-color": "#3b82f6",
    "line-width": 2.5,
    "line-opacity": 0.6,
  },
};

const riverGlow: LineLayerSpecification = {
  id: "terrain-river-glow",
  type: "line",
  source: "terrain",
  filter: ["==", ["get", "type"], "river"],
  paint: {
    "line-color": "#60a5fa",
    "line-width": 7,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.4,
      0,
    ],
  },
};

const riverHitArea: LineLayerSpecification = {
  id: "terrain-river-hit",
  type: "line",
  source: "terrain",
  filter: ["==", ["get", "type"], "river"],
  paint: {
    "line-color": "transparent",
    "line-width": 16,
    "line-opacity": 0,
  },
};

const roadLine: LineLayerSpecification = {
  id: "terrain-road",
  type: "line",
  source: "terrain",
  filter: ["==", ["get", "type"], "road"],
  paint: {
    "line-color": "#78716c",
    "line-width": 2,
    "line-opacity": 0.35,
    "line-dasharray": [6, 2],
  },
};

const townDot: CircleLayerSpecification = {
  id: "terrain-town-dot",
  type: "circle",
  source: "terrain",
  filter: ["==", ["get", "type"], "town"],
  paint: {
    "circle-radius": 5,
    "circle-color": "#404040",
    "circle-stroke-color": "#ffffff",
    "circle-stroke-width": 1.5,
  },
};

const townLabel: SymbolLayerSpecification = {
  id: "terrain-town-label",
  type: "symbol",
  source: "terrain",
  filter: ["==", ["get", "type"], "town"],
  layout: {
    "text-field": ["get", "name"],
    "text-size": 11,
    "text-font": ["Open Sans Regular"],
    "text-offset": [0, 1.2],
    "text-anchor": "top",
    "text-allow-overlap": false,
  },
  paint: {
    "text-color": "#1a1a1a",
    "text-halo-color": "#ffffff",
    "text-halo-width": 1.5,
  },
};

const INTERACTIVE_LAYERS = [
  "terrain-river",
  "terrain-river-hit",
  "terrain-town-dot",
  "terrain-town-label",
  "terrain-hill-fill",
  "terrain-hill-outline",
  "terrain-hill-label",
];

const POPUP_COLORS: Record<string, string> = {
  river: "#3b82f6",
  town: "#404040",
  hill: "#a07d3a",
};

interface PopupInfo {
  lng: number;
  lat: number;
  name: string;
  description?: string;
  featureType: string;
}

export function TerrainLayer() {
  const terrain = useStore((s) => s.terrain);
  const { current: mapRef } = useMap();
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const hoveredIdRef = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!mapRef) return;
      const map = mapRef.getMap();

      const activeLayers = INTERACTIVE_LAYERS.filter((l) => map.getLayer(l));
      if (activeLayers.length === 0) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: activeLayers,
      });

      if (features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        const feature = features[0];
        const fid = feature.id as number | undefined;

        if (hoveredIdRef.current !== null && hoveredIdRef.current !== fid) {
          map.setFeatureState(
            { source: "terrain", id: hoveredIdRef.current },
            { hover: false }
          );
        }
        if (fid !== undefined) {
          map.setFeatureState(
            { source: "terrain", id: fid },
            { hover: true }
          );
          hoveredIdRef.current = fid;
        }

        const featureType = feature.properties?.type ?? "river";

        setPopupInfo({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
          name: feature.properties?.name ?? "",
          description: feature.properties?.description ?? undefined,
          featureType,
        });
      } else {
        if (hoveredIdRef.current !== null) {
          if (map.getSource("terrain")) {
            map.setFeatureState(
              { source: "terrain", id: hoveredIdRef.current },
              { hover: false }
            );
          }
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
    if (hoveredIdRef.current !== null && map.getSource("terrain")) {
      map.setFeatureState(
        { source: "terrain", id: hoveredIdRef.current },
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

  if (!terrain) return null;

  // Add numeric IDs for feature-state support
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const src = terrain as any;
  const terrainWithIds = {
    type: "FeatureCollection" as const,
    features: src.features.map((f: Record<string, unknown>, i: number) => ({
      ...f,
      id: i,
    })),
  };

  return (
    <>
      <Source id="terrain" type="geojson" data={terrainWithIds}>
        <Layer {...forestFill} />
        <Layer {...hillFill} />
        <Layer {...hillOutline} />
        <Layer {...riverHitArea} />
        <Layer {...riverGlow} />
        <Layer {...riverLine} />
        <Layer {...roadLine} />
        <Layer {...townDot} />
        <Layer {...townLabel} />
        <Layer {...hillLabel} />
      </Source>
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
            <div className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2"
                style={{
                  backgroundColor:
                    POPUP_COLORS[popupInfo.featureType] ?? "#3b82f6",
                }}
              />
              <span className="font-bold text-[11px] text-black">
                {popupInfo.name}
              </span>
            </div>
            {popupInfo.description && (
              <p className="text-[10px] text-[#404040] mt-1 max-w-[200px]">
                {popupInfo.description}
              </p>
            )}
          </div>
        </Popup>
      )}
    </>
  );
}
