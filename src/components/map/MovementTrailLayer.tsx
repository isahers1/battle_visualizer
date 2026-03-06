"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { ECHELON_MIN_ZOOM } from "@/lib/zoomConfig";
import type { LineLayerSpecification } from "maplibre-gl";
import type { Echelon } from "@/types";

const ALLIED_COLOR = "#2563eb";
const AXIS_COLOR = "#dc2626";
const ALLIED_HIGHLIGHT = "#60a5fa";
const AXIS_HIGHLIGHT = "#f87171";

const alliedBaseTrailStyle: LineLayerSpecification = {
  id: "movement-trails-allied-base",
  type: "line",
  source: "movement-trails",
  filter: ["==", ["get", "side"], "allied"],
  paint: {
    "line-color": ALLIED_COLOR,
    "line-width": 2,
    "line-opacity": 0.35,
    "line-gradient": [
      "interpolate",
      ["linear"],
      ["line-progress"],
      0, `rgba(37, 99, 235, 0.05)`,
      0.7, `rgba(37, 99, 235, 0.25)`,
      1, `rgba(37, 99, 235, 0.6)`,
    ],
  },
};

const axisBaseTrailStyle: LineLayerSpecification = {
  id: "movement-trails-axis-base",
  type: "line",
  source: "movement-trails",
  filter: ["==", ["get", "side"], "axis"],
  paint: {
    "line-color": AXIS_COLOR,
    "line-width": 2,
    "line-opacity": 0.35,
    "line-gradient": [
      "interpolate",
      ["linear"],
      ["line-progress"],
      0, `rgba(220, 38, 38, 0.05)`,
      0.7, `rgba(220, 38, 38, 0.25)`,
      1, `rgba(220, 38, 38, 0.6)`,
    ],
  },
};

const NEVER_MATCH_FILTER: LineLayerSpecification["filter"] = [
  "==",
  ["get", "unitId"],
  "",
];

const glowTrailStyle: LineLayerSpecification = {
  id: "movement-trails-glow",
  type: "line",
  source: "movement-trails",
  filter: NEVER_MATCH_FILTER,
  paint: {
    "line-color": ["get", "highlightColor"],
    "line-width": 10,
    "line-opacity": 0.25,
    "line-blur": 4,
  },
};

const highlightTrailStyle: LineLayerSpecification = {
  id: "movement-trails-highlight",
  type: "line",
  source: "movement-trails",
  filter: NEVER_MATCH_FILTER,
  paint: {
    "line-color": ["get", "highlightColor"],
    "line-width": 4,
    "line-opacity": 0.85,
  },
};

export function MovementTrailLayer() {
  const timeline = useStore((s) => s.timeline);
  const units = useStore((s) => s.units);
  const currentStep = useStore((s) => s.currentStep);
  const previousStep = useStore((s) => s.previousStep);
  const animationProgress = useStore((s) => s.animationProgress);
  const animationDirection = useStore((s) => s.animationDirection);
  const zoom = useStore((s) => s.viewport.zoom);
  const selectedUnitId = useStore((s) => s.selectedUnitId);
  const hoveredUnitId = useStore((s) => s.hoveredUnitId);

  const activeUnitId = selectedUnitId ?? hoveredUnitId;

  const geojson = useMemo(() => {
    if (timeline.length === 0) return null;

    const shouldInterpolate =
      animationDirection === "forward" && animationProgress < 1;

    const features: GeoJSON.Feature[] = [];

    for (const unit of Object.values(units)) {
      const minZoom = ECHELON_MIN_ZOOM[unit.echelon as Echelon];
      if (minZoom !== undefined && zoom < minZoom) continue;

      const coords: [number, number][] = [];
      let isRetreating = false;

      // Build trail up to previous step when interpolating, else up to current step
      const trailEnd = shouldInterpolate ? previousStep : currentStep;

      for (let step = 0; step <= trailEnd; step++) {
        const snapshot = timeline[step];
        if (!snapshot) continue;
        const unitState = snapshot.unitStates[unit.id];
        if (!unitState) continue;

        const pos = unitState.position;
        const last = coords[coords.length - 1];
        if (last && last[0] === pos[0] && last[1] === pos[1]) continue;
        coords.push(pos);

        if (step === currentStep) {
          isRetreating = unitState.status === "retreating";
        }
      }

      // Add interpolated position during animation
      if (shouldInterpolate) {
        const currentSnapshot = timeline[currentStep];
        const prevSnapshot = timeline[previousStep];
        if (currentSnapshot && prevSnapshot) {
          const currentState = currentSnapshot.unitStates[unit.id];
          const prevState = prevSnapshot.unitStates[unit.id];
          if (currentState && prevState) {
            const t = animationProgress;
            const interpPos: [number, number] = [
              prevState.position[0] + (currentState.position[0] - prevState.position[0]) * t,
              prevState.position[1] + (currentState.position[1] - prevState.position[1]) * t,
            ];
            const last = coords[coords.length - 1];
            if (!last || last[0] !== interpPos[0] || last[1] !== interpPos[1]) {
              coords.push(interpPos);
            }
            isRetreating = currentState.status === "retreating";
          }
        }
      }

      if (coords.length < 2) continue;

      const isAllied = unit.side === "allied";
      features.push({
        type: "Feature",
        properties: {
          unitId: unit.id,
          side: unit.side,
          color: isAllied ? ALLIED_COLOR : AXIS_COLOR,
          highlightColor: isAllied ? ALLIED_HIGHLIGHT : AXIS_HIGHLIGHT,
          retreating: isRetreating,
        },
        geometry: {
          type: "LineString",
          coordinates: coords,
        },
      });
    }

    return { type: "FeatureCollection" as const, features };
  }, [timeline, units, currentStep, previousStep, animationProgress, animationDirection, zoom]);

  if (!geojson || geojson.features.length === 0) return null;

  const activeFilter: LineLayerSpecification["filter"] = activeUnitId
    ? ["==", ["get", "unitId"], activeUnitId]
    : NEVER_MATCH_FILTER;

  return (
    <Source id="movement-trails" type="geojson" data={geojson} lineMetrics>
      <Layer {...alliedBaseTrailStyle} />
      <Layer {...axisBaseTrailStyle} />
      <Layer {...glowTrailStyle} filter={activeFilter} />
      <Layer {...highlightTrailStyle} filter={activeFilter} />
    </Source>
  );
}
