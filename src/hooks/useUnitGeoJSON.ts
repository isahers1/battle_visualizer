"use client";

import { useMemo } from "react";
import { useStore } from "@/stores";
import { getIconId } from "@/lib/iconRenderer";
import { ECHELON_MIN_ZOOM } from "@/lib/zoomConfig";
import type { Echelon } from "@/types";

export function useUnitGeoJSON(): GeoJSON.FeatureCollection | null {
  const units = useStore((s) => s.units);
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);
  const previousStep = useStore((s) => s.previousStep);
  const animationProgress = useStore((s) => s.animationProgress);
  const animationDirection = useStore((s) => s.animationDirection);

  return useMemo(() => {
    const currentSnapshot = timeline[currentStep];
    if (!currentSnapshot) return null;

    const previousSnapshot = timeline[previousStep];
    const shouldInterpolate =
      animationDirection === "forward" && animationProgress < 1 && previousSnapshot;

    const features: GeoJSON.Feature[] = [];

    for (const [unitId, unitState] of Object.entries(
      currentSnapshot.unitStates
    )) {
      const unit = units[unitId];
      if (!unit) continue;

      let position = unitState.position;

      if (shouldInterpolate && previousSnapshot?.unitStates[unitId]) {
        const prevPos = previousSnapshot.unitStates[unitId].position;
        const t = animationProgress;
        position = [
          prevPos[0] + (unitState.position[0] - prevPos[0]) * t,
          prevPos[1] + (unitState.position[1] - prevPos[1]) * t,
        ];
      }

      const minZoom = ECHELON_MIN_ZOOM[unit.echelon as Echelon] ?? 0;

      features.push({
        type: "Feature",
        geometry: {
          type: "Point",
          coordinates: position,
        },
        properties: {
          id: unitId,
          name: unit.shortName,
          side: unit.side,
          unitType: unit.unitType,
          echelon: unit.echelon,
          strength: unitState.strength,
          status: unitState.status,
          icon: getIconId(unit.unitType, unit.side),
          minZoom,
        },
      });
    }

    return {
      type: "FeatureCollection" as const,
      features,
    };
  }, [
    units,
    timeline,
    currentStep,
    previousStep,
    animationProgress,
    animationDirection,
  ]);
}
