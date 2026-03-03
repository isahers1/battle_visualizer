"use client";

import { useCallback } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import type { MapLayerMouseEvent } from "maplibre-gl";

const UNIT_LAYERS = [
  "units-strategic",
  "units-operational",
  "units-tactical",
];

export function MapEventHandlers() {
  const { current: map } = useMap();
  const setHoveredUnit = useStore((s) => s.setHoveredUnit);
  const openDetailPanel = useStore((s) => s.openDetailPanel);

  const onMouseMove = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!map) return;
      const mapInstance = map.getMap();

      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: UNIT_LAYERS,
      });

      if (features.length > 0) {
        mapInstance.getCanvas().style.cursor = "pointer";
        const unitId = features[0].properties?.id;
        if (unitId) {
          setHoveredUnit(unitId, { x: e.point.x, y: e.point.y });
        }
      } else {
        mapInstance.getCanvas().style.cursor = "";
        setHoveredUnit(null);
      }
    },
    [map, setHoveredUnit]
  );

  const onClick = useCallback(
    (e: MapLayerMouseEvent) => {
      if (!map) return;
      const mapInstance = map.getMap();

      const features = mapInstance.queryRenderedFeatures(e.point, {
        layers: UNIT_LAYERS,
      });

      if (features.length > 0) {
        const unitId = features[0].properties?.id;
        if (unitId) {
          openDetailPanel(unitId);
        }
      }
    },
    [map, openDetailPanel]
  );

  // Attach events using map effect
  if (map) {
    const mapInstance = map.getMap();
    mapInstance.off("mousemove", onMouseMove);
    mapInstance.on("mousemove", onMouseMove);
    mapInstance.off("click", onClick);
    mapInstance.on("click", onClick);
  }

  return null;
}
