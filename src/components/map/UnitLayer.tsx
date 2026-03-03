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

    return Object.entries(snapshot.unitStates)
      .filter(([unitId]) => {
        const unit = units[unitId];
        if (!unit) return false;
        const minZoom = ECHELON_MIN_ZOOM[unit.echelon as Echelon] ?? 0;
        return zoom >= minZoom;
      })
      .map(([unitId, unitState]) => ({
        unitId,
        unit: units[unitId],
        state: unitState,
      }));
  }, [snapshot, units, zoom]);

  // Scale icons based on zoom — smaller for overview, slightly larger when zoomed in
  const iconScale = zoom < 9.5 ? 0.85 : zoom < 12 ? 0.9 : 0.8;

  return (
    <>
      {visibleUnits.map(({ unitId, unit, state }) => (
        <Marker
          key={unitId}
          longitude={state.position[0]}
          latitude={state.position[1]}
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
