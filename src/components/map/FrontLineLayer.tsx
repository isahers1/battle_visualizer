"use client";

import { useMemo } from "react";
import { Source, Layer } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import frontlinesData from "@/data/battles/bulge/frontlines.json";

interface StageData {
  index: number;
  alliedFront: [number, number][];
  axisFront: [number, number][];
}

const stages = frontlinesData.stages as StageData[];

function interpolateLines(
  from: [number, number][],
  to: [number, number][],
  t: number
): [number, number][] {
  const len = Math.min(from.length, to.length);
  const result: [number, number][] = [];
  for (let i = 0; i < len; i++) {
    result.push([
      from[i][0] + (to[i][0] - from[i][0]) * t,
      from[i][1] + (to[i][1] - from[i][1]) * t,
    ]);
  }
  return result;
}

function getStageLines(step: number, progress: number) {
  const currentStage = stages.find((s) => s.index === step);
  const nextStage = stages.find((s) => s.index === step + 1);

  if (!currentStage) {
    // Find the closest stages to interpolate between
    let lower: StageData | undefined;
    let upper: StageData | undefined;
    for (const s of stages) {
      if (s.index <= step) lower = s;
      if (s.index > step && !upper) upper = s;
    }
    if (lower && upper) {
      const range = upper.index - lower.index;
      const t = (step - lower.index) / range;
      return {
        alliedFront: interpolateLines(lower.alliedFront, upper.alliedFront, t),
        axisFront: interpolateLines(lower.axisFront, upper.axisFront, t),
      };
    }
    if (lower) return { alliedFront: lower.alliedFront, axisFront: lower.axisFront };
    return { alliedFront: stages[0].alliedFront, axisFront: stages[0].axisFront };
  }

  if (nextStage && progress < 1) {
    return {
      alliedFront: interpolateLines(currentStage.alliedFront, nextStage.alliedFront, progress),
      axisFront: interpolateLines(currentStage.axisFront, nextStage.axisFront, progress),
    };
  }

  return {
    alliedFront: currentStage.alliedFront,
    axisFront: currentStage.axisFront,
  };
}

function lineToPolygon(
  line: [number, number][],
  side: "allied" | "axis"
): [number, number][] {
  // Create a polygon by extending the line westward (allied) or eastward (axis)
  const offset = side === "allied" ? -0.15 : 0.15;
  const extended = line.map(([lng, lat]): [number, number] => [lng + offset, lat]);
  // Close the polygon: line forward, extended backward
  return [...line, ...extended.reverse(), line[0]];
}

export function FrontLineLayer() {
  const currentStep = useStore((s) => s.currentStep);
  const animationProgress = useStore((s) => s.animationProgress);

  const geojson = useMemo(() => {
    const { alliedFront, axisFront } = getStageLines(currentStep, animationProgress);

    const alliedPoly = lineToPolygon(alliedFront, "allied");
    const axisPoly = lineToPolygon(axisFront, "axis");

    return {
      type: "FeatureCollection" as const,
      features: [
        {
          type: "Feature" as const,
          properties: { side: "allied" },
          geometry: {
            type: "Polygon" as const,
            coordinates: [alliedPoly],
          },
        },
        {
          type: "Feature" as const,
          properties: { side: "axis" },
          geometry: {
            type: "Polygon" as const,
            coordinates: [axisPoly],
          },
        },
        {
          type: "Feature" as const,
          properties: { side: "allied", lineType: "front" },
          geometry: {
            type: "LineString" as const,
            coordinates: alliedFront,
          },
        },
        {
          type: "Feature" as const,
          properties: { side: "axis", lineType: "front" },
          geometry: {
            type: "LineString" as const,
            coordinates: axisFront,
          },
        },
      ],
    };
  }, [currentStep, animationProgress]);

  return (
    <Source id="front-lines" type="geojson" data={geojson}>
      {/* Allied fill */}
      <Layer
        id="front-line-allied-fill"
        type="fill"
        filter={["all", ["==", "side", "allied"], ["!has", "lineType"]]}
        paint={{
          "fill-color": "#2563eb",
          "fill-opacity": 0.08,
        }}
      />
      {/* Axis fill */}
      <Layer
        id="front-line-axis-fill"
        type="fill"
        filter={["all", ["==", "side", "axis"], ["!has", "lineType"]]}
        paint={{
          "fill-color": "#dc2626",
          "fill-opacity": 0.08,
        }}
      />
      {/* Allied front line */}
      <Layer
        id="front-line-allied-line"
        type="line"
        filter={["all", ["==", "side", "allied"], ["has", "lineType"]]}
        paint={{
          "line-color": "#2563eb",
          "line-width": 2.5,
          "line-dasharray": [4, 3],
          "line-opacity": 0.6,
        }}
      />
      {/* Axis front line */}
      <Layer
        id="front-line-axis-line"
        type="line"
        filter={["all", ["==", "side", "axis"], ["has", "lineType"]]}
        paint={{
          "line-color": "#dc2626",
          "line-width": 2.5,
          "line-dasharray": [4, 3],
          "line-opacity": 0.6,
        }}
      />
    </Source>
  );
}
