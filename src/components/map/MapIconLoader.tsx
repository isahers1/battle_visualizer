"use client";

import { useEffect, useState } from "react";
import { useMap } from "react-map-gl/maplibre";
import {
  renderUnitIcon,
  getIconId,
  UNIT_TYPES,
  SIDES,
  ICON_SIZE,
} from "@/lib/iconRenderer";

export function MapIconLoader() {
  const { current: map } = useMap();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!map || loaded) return;

    const mapInstance = map.getMap();

    function loadIcons() {
      for (const side of SIDES) {
        for (const unitType of UNIT_TYPES) {
          const iconId = getIconId(unitType, side);
          if (!mapInstance.hasImage(iconId)) {
            const imageData = renderUnitIcon(unitType, side);
            mapInstance.addImage(iconId, {
              width: ICON_SIZE,
              height: ICON_SIZE,
              data: new Uint8Array(imageData.data.buffer),
            });
          }
        }
      }
      setLoaded(true);
    }

    if (mapInstance.isStyleLoaded()) {
      loadIcons();
    } else {
      mapInstance.on("style.load", loadIcons);
      return () => {
        mapInstance.off("style.load", loadIcons);
      };
    }
  }, [map, loaded]);

  return null;
}
