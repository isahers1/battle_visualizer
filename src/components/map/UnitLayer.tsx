"use client";

import { useMemo, useCallback } from "react";
import { Marker } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import { ECHELON_MIN_ZOOM } from "@/lib/zoomConfig";
import { UnitIcon } from "./UnitIcon";
import type { Echelon } from "@/types";

export function UnitLayer() {
  const units = useStore((s) => s.units);
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);
  const previousStep = useStore((s) => s.previousStep);
  const animationProgress = useStore((s) => s.animationProgress);
  const animationDirection = useStore((s) => s.animationDirection);
  const zoom = useStore((s) => s.viewport.zoom);
  const openDetailPanel = useStore((s) => s.openDetailPanel);
  const setHoveredUnit = useStore((s) => s.setHoveredUnit);
  const snapshot = useCurrentSnapshot();

  const handleClick = useCallback(
    (unitId: string) => {
      openDetailPanel(unitId);
    },
    [openDetailPanel]
  );

  const handleMouseEnter = useCallback(
    (unitId: string, e: React.MouseEvent) => {
      setHoveredUnit(unitId, { x: e.clientX, y: e.clientY });
    },
    [setHoveredUnit]
  );

  const handleMouseLeave = useCallback(() => {
    setHoveredUnit(null);
  }, [setHoveredUnit]);

  const visibleUnits = useMemo(() => {
    if (!snapshot) return [];

    const previousSnapshot = timeline[previousStep];
    const shouldInterpolate =
      animationDirection === "forward" && animationProgress < 1 && previousSnapshot;

    return Object.entries(snapshot.unitStates)
      .filter(([unitId]) => {
        const unit = units[unitId];
        if (!unit) return false;
        const minZoom = ECHELON_MIN_ZOOM[unit.echelon as Echelon] ?? 0;
        return zoom >= minZoom;
      })
      .map(([unitId, unitState]) => {
        let position = unitState.position;

        if (shouldInterpolate && previousSnapshot?.unitStates[unitId]) {
          const prevPos = previousSnapshot.unitStates[unitId].position;
          const t = animationProgress;
          position = [
            prevPos[0] + (unitState.position[0] - prevPos[0]) * t,
            prevPos[1] + (unitState.position[1] - prevPos[1]) * t,
          ];
        }

        return {
          unitId,
          unit: units[unitId],
          state: unitState,
          position,
        };
      });
  }, [snapshot, units, zoom, timeline, previousStep, animationDirection, animationProgress]);

  // Scale icons based on zoom — smaller for overview, slightly larger when zoomed in
  const iconScale = zoom < 8 ? 0.7 : zoom < 9.5 ? 0.8 : zoom < 11 ? 0.85 : 0.8;

  return (
    <>
      {visibleUnits.map(({ unitId, unit, state, position }) => (
        <Marker
          key={unitId}
          longitude={position[0]}
          latitude={position[1]}
          anchor="center"
          onClick={(e) => {
            e.originalEvent.stopPropagation();
            handleClick(unitId);
          }}
        >
          <div
            onMouseEnter={(e) => handleMouseEnter(unitId, e)}
            onMouseLeave={handleMouseLeave}
            className="cursor-pointer transition-transform hover:scale-110"
          >
            <UnitIcon
              unitType={unit.unitType}
              echelon={unit.echelon}
              side={unit.side}
              name={unit.shortName}
              strength={state.strength}
              status={state.status}
              scale={iconScale}
            />
          </div>
        </Marker>
      ))}
    </>
  );
}
