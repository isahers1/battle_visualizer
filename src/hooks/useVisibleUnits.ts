"use client";

import { useMemo } from "react";
import { useStore } from "@/stores";
import { ECHELON_MIN_ZOOM } from "@/lib/zoomConfig";
import type { Unit, UnitSnapshot, Echelon } from "@/types";

export interface VisibleUnit {
  unit: Unit;
  snapshot: UnitSnapshot;
}

export function useVisibleUnits(): VisibleUnit[] {
  const units = useStore((s) => s.units);
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);
  const zoom = useStore((s) => s.viewport.zoom);

  return useMemo(() => {
    const snapshot = timeline[currentStep];
    if (!snapshot) return [];

    const result: VisibleUnit[] = [];

    for (const [unitId, unitSnapshot] of Object.entries(snapshot.unitStates)) {
      const unit = units[unitId];
      if (!unit) continue;

      const minZoom = ECHELON_MIN_ZOOM[unit.echelon as Echelon];
      if (zoom >= minZoom) {
        result.push({ unit, snapshot: unitSnapshot });
      }
    }

    return result;
  }, [units, timeline, currentStep, zoom]);
}
