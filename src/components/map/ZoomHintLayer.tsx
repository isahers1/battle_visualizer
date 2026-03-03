"use client";

import { useMemo } from "react";
import { Marker } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import { ECHELON_MIN_ZOOM } from "@/lib/zoomConfig";
import type { Echelon } from "@/types";

/**
 * Shows small pulsing dots at positions of units that are hidden due to zoom level,
 * giving the user a hint that zooming in will reveal more units.
 */
export function ZoomHintLayer() {
  const units = useStore((s) => s.units);
  const zoom = useStore((s) => s.viewport.zoom);
  const snapshot = useCurrentSnapshot();

  const hiddenUnits = useMemo(() => {
    if (!snapshot) return [];

    return Object.entries(snapshot.unitStates)
      .filter(([unitId]) => {
        const unit = units[unitId];
        if (!unit) return false;
        const minZoom = ECHELON_MIN_ZOOM[unit.echelon as Echelon] ?? 0;
        // Show hint dot only for units that are hidden (below zoom threshold)
        return zoom < minZoom;
      })
      .map(([unitId, unitState]) => ({
        unitId,
        side: units[unitId].side,
        position: unitState.position,
      }));
  }, [snapshot, units, zoom]);

  if (hiddenUnits.length === 0) return null;

  return (
    <>
      {hiddenUnits.map(({ unitId, side, position }) => (
        <Marker
          key={`hint-${unitId}`}
          longitude={position[0]}
          latitude={position[1]}
          anchor="center"
        >
          <div
            className="zoom-hint-dot"
            style={{
              backgroundColor:
                side === "allied"
                  ? "rgba(37, 99, 235, 0.6)"
                  : "rgba(220, 38, 38, 0.6)",
              borderColor:
                side === "allied"
                  ? "rgba(37, 99, 235, 0.9)"
                  : "rgba(220, 38, 38, 0.9)",
            }}
          />
        </Marker>
      ))}
    </>
  );
}
