"use client";

import { useMemo, useState } from "react";
import Map, { Source, Layer } from "react-map-gl/maplibre";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import { openTopoMapStyle } from "@/lib/mapStyle";
import type {
  CircleLayerSpecification,
  FillLayerSpecification,
  LineLayerSpecification,
} from "maplibre-gl";

// Unit dots
const unitDotsStyle: CircleLayerSpecification = {
  id: "minimap-unit-dots",
  type: "circle",
  source: "minimap-units",
  paint: {
    "circle-radius": 3,
    "circle-color": ["get", "color"],
    "circle-opacity": 0.9,
  },
};

// Viewport bounding box
const viewportFillStyle: FillLayerSpecification = {
  id: "minimap-viewport-fill",
  type: "fill",
  source: "minimap-viewport",
  paint: {
    "fill-color": "#000000",
    "fill-opacity": 0.35,
  },
};

const viewportOutlineStyle: LineLayerSpecification = {
  id: "minimap-viewport-outline",
  type: "line",
  source: "minimap-viewport",
  paint: {
    "line-color": "#000080",
    "line-width": 2,
    "line-opacity": 0.8,
  },
};

// Terrain layers (simplified for minimap)
const minimapForestFill: FillLayerSpecification = {
  id: "minimap-forest-fill",
  type: "fill",
  source: "minimap-terrain",
  filter: ["==", ["get", "type"], "forest"],
  paint: {
    "fill-color": "#3a7d32",
    "fill-opacity": 0.12,
  },
};

const minimapRiverLine: LineLayerSpecification = {
  id: "minimap-river",
  type: "line",
  source: "minimap-terrain",
  filter: ["==", ["get", "type"], "river"],
  paint: {
    "line-color": "#3b82f6",
    "line-width": 1.5,
    "line-opacity": 0.5,
  },
};

const minimapRoadLine: LineLayerSpecification = {
  id: "minimap-road",
  type: "line",
  source: "minimap-terrain",
  filter: ["==", ["get", "type"], "road"],
  paint: {
    "line-color": "#78716c",
    "line-width": 1,
    "line-opacity": 0.25,
    "line-dasharray": [4, 2],
  },
};

// Fortification layers (simplified for minimap)
const minimapDefensiveLine: LineLayerSpecification = {
  id: "minimap-defensive-line",
  type: "line",
  source: "minimap-fortifications",
  filter: ["==", ["get", "type"], "defensive_line"],
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "side"], "allied"],
      "#2563eb",
      "#dc2626",
    ],
    "line-width": 2,
    "line-opacity": 0.5,
    "line-dasharray": [6, 3],
  },
};

const minimapAntiTankLine: LineLayerSpecification = {
  id: "minimap-anti-tank",
  type: "line",
  source: "minimap-fortifications",
  filter: ["==", ["get", "type"], "anti_tank"],
  paint: {
    "line-color": "#dc2626",
    "line-width": 2,
    "line-opacity": 0.35,
    "line-dasharray": [2, 2],
  },
};

export function Minimap() {
  const [isOpen, setIsOpen] = useState(true);
  const metadata = useStore((s) => s.metadata);
  const viewportBounds = useStore((s) => s.viewportBounds);
  const terrain = useStore((s) => s.terrain);
  const fortifications = useStore((s) => s.fortifications);
  const units = useStore((s) => s.units);
  const snapshot = useCurrentSnapshot();

  const unitGeojson = useMemo(() => {
    if (!snapshot) return null;

    const features = Object.values(snapshot.unitStates).map((us) => ({
      type: "Feature" as const,
      properties: {
        unitId: us.unitId,
        color: units[us.unitId]?.side === "axis" ? "#dc2626" : "#2563eb",
      },
      geometry: {
        type: "Point" as const,
        coordinates: us.position,
      },
    }));

    return { type: "FeatureCollection" as const, features };
  }, [snapshot, units]);

  const viewportGeojson = useMemo(() => {
    if (!viewportBounds) return null;

    const { north, south, east, west } = viewportBounds;
    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: {},
          geometry: {
            type: "Polygon" as const,
            coordinates: [
              // Outer ring: covers entire world
              [
                [-180, -90],
                [180, -90],
                [180, 90],
                [-180, 90],
                [-180, -90],
              ],
              // Inner ring (hole): the viewport bounds
              [
                [west, north],
                [east, north],
                [east, south],
                [west, south],
                [west, north],
              ],
            ],
          },
        },
      ],
    };
  }, [viewportBounds]);

  return (
    <div className="absolute top-2 left-2 z-10">
      <div className="w95-raised w95-font" style={{ width: 180 }}>
        <div
          className="w95-titlebar text-[10px] cursor-pointer select-none"
          onClick={() => setIsOpen((o) => !o)}
        >
          <span className="mr-1">&#127758;</span>
          Overview
          <button
            className="w95-btn !p-0 !min-h-[14px] w-[14px] ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px]"
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((o) => !o);
            }}
          >
            {isOpen ? "\u2212" : "+"}
          </button>
        </div>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
              style={{ overflow: "hidden" }}
            >
              <div
                className="w95-sunken m-1"
                style={{ height: 150, pointerEvents: "none" }}
              >
                <Map
                  id="minimap"
                  initialViewState={
                    metadata
                      ? {
                          bounds: [
                            [metadata.bounds.west - 1.0, metadata.bounds.south - 0.75],
                            [metadata.bounds.east + 1.0, metadata.bounds.north + 0.75],
                          ],
                          fitBoundsOptions: { padding: 5 },
                        }
                      : { longitude: 0, latitude: 0, zoom: 1 }
                  }
                  style={{ width: "100%", height: "100%" }}
                  mapStyle={openTopoMapStyle}
                  scrollZoom={false}
                  dragPan={false}
                  dragRotate={false}
                  doubleClickZoom={false}
                  touchZoomRotate={false}
                  touchPitch={false}
                  keyboard={false}
                  boxZoom={false}
                  attributionControl={false}
                >
                  {/* Terrain: forests, rivers, roads */}
                  {terrain && (
                    <Source
                      id="minimap-terrain"
                      type="geojson"
                      data={terrain}
                    >
                      <Layer {...minimapForestFill} />
                      <Layer {...minimapRiverLine} />
                      <Layer {...minimapRoadLine} />
                    </Source>
                  )}

                  {/* Fortifications: defensive lines, anti-tank */}
                  {fortifications && (
                    <Source
                      id="minimap-fortifications"
                      type="geojson"
                      data={fortifications}
                    >
                      <Layer {...minimapDefensiveLine} />
                      <Layer {...minimapAntiTankLine} />
                    </Source>
                  )}

                  {/* Unit dots */}
                  {unitGeojson && (
                    <Source
                      id="minimap-units"
                      type="geojson"
                      data={unitGeojson}
                    >
                      <Layer {...unitDotsStyle} />
                    </Source>
                  )}

                  {/* Viewport rectangle */}
                  {viewportGeojson && (
                    <Source
                      id="minimap-viewport"
                      type="geojson"
                      data={viewportGeojson}
                    >
                      <Layer {...viewportFillStyle} />
                      <Layer {...viewportOutlineStyle} />
                    </Source>
                  )}
                </Map>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
