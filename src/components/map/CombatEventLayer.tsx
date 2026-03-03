"use client";

import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { Source, Layer, Popup, useMap } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import type { LineLayerSpecification, CircleLayerSpecification } from "maplibre-gl";

const EVENT_TYPE_LABELS: Record<string, { label: string; color: string }> = {
  assault: { label: "Assault", color: "#ef4444" },
  artillery_fire: { label: "Artillery Fire", color: "#f59e0b" },
  air_strike: { label: "Air Strike", color: "#8b5cf6" },
  retreat: { label: "Retreat", color: "#6b7280" },
};

const combatLineStyle: LineLayerSpecification = {
  id: "combat-events-line",
  type: "line",
  source: "combat-events",
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "type"], "artillery_fire"],
      "#f59e0b",
      ["==", ["get", "type"], "air_strike"],
      "#8b5cf6",
      ["==", ["get", "type"], "retreat"],
      "#6b7280",
      "#ef4444",
    ],
    "line-width": [
      "case",
      ["==", ["get", "type"], "artillery_fire"],
      3,
      ["==", ["get", "type"], "air_strike"],
      2.5,
      2,
    ],
    "line-opacity": 0.7,
    "line-dasharray": [
      "case",
      ["==", ["get", "type"], "artillery_fire"],
      ["literal", [2, 4]],
      ["==", ["get", "type"], "retreat"],
      ["literal", [4, 4]],
      ["literal", [1, 0]],
    ],
  },
};

// Glow layer for hover highlight
const combatLineGlow: LineLayerSpecification = {
  id: "combat-events-line-glow",
  type: "line",
  source: "combat-events",
  paint: {
    "line-color": [
      "case",
      ["==", ["get", "type"], "artillery_fire"],
      "#fbbf24",
      ["==", ["get", "type"], "air_strike"],
      "#a78bfa",
      ["==", ["get", "type"], "retreat"],
      "#9ca3af",
      "#f87171",
    ],
    "line-width": 8,
    "line-opacity": [
      "case",
      ["boolean", ["feature-state", "hover"], false],
      0.5,
      0,
    ],
  },
};

// Invisible wide hit area for easier hover
const combatLineHitArea: LineLayerSpecification = {
  id: "combat-events-hit-area",
  type: "line",
  source: "combat-events",
  paint: {
    "line-color": "transparent",
    "line-width": 20,
    "line-opacity": 0,
  },
};

const combatPointStyle: CircleLayerSpecification = {
  id: "combat-events-point",
  type: "circle",
  source: "combat-events-targets",
  paint: {
    "circle-radius": 6,
    "circle-color": [
      "case",
      ["==", ["get", "type"], "artillery_fire"],
      "#f59e0b",
      ["==", ["get", "type"], "air_strike"],
      "#8b5cf6",
      "#ef4444",
    ],
    "circle-opacity": 0.5,
    "circle-stroke-color": [
      "case",
      ["==", ["get", "type"], "artillery_fire"],
      "#f59e0b",
      ["==", ["get", "type"], "air_strike"],
      "#8b5cf6",
      "#ef4444",
    ],
    "circle-stroke-width": 2,
    "circle-stroke-opacity": 0.8,
  },
};

const INTERACTIVE_LAYERS = [
  "combat-events-line",
  "combat-events-hit-area",
];

interface PopupInfo {
  lng: number;
  lat: number;
  type: string;
  description: string;
}

export function CombatEventLayer() {
  const snapshot = useCurrentSnapshot();
  const animationDirection = useStore((s) => s.animationDirection);
  const animationProgress = useStore((s) => s.animationProgress);
  const { current: mapRef } = useMap();
  const [popupInfo, setPopupInfo] = useState<PopupInfo | null>(null);
  const hoveredIdRef = useRef<number | null>(null);

  const lineGeojson = useMemo(() => {
    if (!snapshot || snapshot.combatEvents.length === 0) return null;

    const features = snapshot.combatEvents.map((event, i) => ({
      type: "Feature" as const,
      id: i,
      properties: {
        id: event.id,
        type: event.type,
        description: event.description,
      },
      geometry: {
        type: "LineString" as const,
        coordinates: [event.fromPosition, event.toPosition],
      },
    }));

    return { type: "FeatureCollection" as const, features };
  }, [snapshot]);

  const targetGeojson = useMemo(() => {
    if (!snapshot || snapshot.combatEvents.length === 0) return null;

    const features = snapshot.combatEvents
      .filter((e) => e.toPosition)
      .map((event) => ({
        type: "Feature" as const,
        properties: { type: event.type },
        geometry: {
          type: "Point" as const,
          coordinates: event.toPosition,
        },
      }));

    return { type: "FeatureCollection" as const, features };
  }, [snapshot]);

  const handleMouseMove = useCallback(
    (e: maplibregl.MapMouseEvent) => {
      if (!mapRef) return;
      const map = mapRef.getMap();

      // Check if combat event layers exist before querying
      if (!map.getLayer("combat-events-line")) return;

      const features = map.queryRenderedFeatures(e.point, {
        layers: INTERACTIVE_LAYERS.filter((l) => map.getLayer(l)),
      });

      if (features.length > 0) {
        map.getCanvas().style.cursor = "pointer";
        const feature = features[0];
        const fid = feature.id as number | undefined;

        if (hoveredIdRef.current !== null && hoveredIdRef.current !== fid) {
          map.setFeatureState(
            { source: "combat-events", id: hoveredIdRef.current },
            { hover: false }
          );
        }
        if (fid !== undefined) {
          map.setFeatureState(
            { source: "combat-events", id: fid },
            { hover: true }
          );
          hoveredIdRef.current = fid;
        }

        setPopupInfo({
          lng: e.lngLat.lng,
          lat: e.lngLat.lat,
          type: feature.properties?.type ?? "",
          description: feature.properties?.description ?? "",
        });
      } else {
        if (hoveredIdRef.current !== null) {
          if (map.getSource("combat-events")) {
            map.setFeatureState(
              { source: "combat-events", id: hoveredIdRef.current },
              { hover: false }
            );
          }
          hoveredIdRef.current = null;
        }
        setPopupInfo(null);
      }
    },
    [mapRef]
  );

  const handleMouseLeave = useCallback(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();
    if (hoveredIdRef.current !== null && map.getSource("combat-events")) {
      map.setFeatureState(
        { source: "combat-events", id: hoveredIdRef.current },
        { hover: false }
      );
      hoveredIdRef.current = null;
    }
    setPopupInfo(null);
  }, [mapRef]);

  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();

    map.on("mousemove", handleMouseMove);
    map.on("mouseleave", handleMouseLeave);

    return () => {
      map.off("mousemove", handleMouseMove);
      map.off("mouseleave", handleMouseLeave);
    };
  }, [mapRef, handleMouseMove, handleMouseLeave]);

  // Only show combat events during forward animation or at rest
  const show =
    animationDirection === "forward" ||
    (animationDirection !== "backward" && animationProgress >= 1);

  if (!show || !lineGeojson) return null;

  const eventInfo = popupInfo ? EVENT_TYPE_LABELS[popupInfo.type] : null;

  return (
    <>
      <Source id="combat-events" type="geojson" data={lineGeojson}>
        <Layer {...combatLineHitArea} />
        <Layer {...combatLineGlow} />
        <Layer {...combatLineStyle} />
      </Source>
      {targetGeojson && (
        <Source id="combat-events-targets" type="geojson" data={targetGeojson}>
          <Layer {...combatPointStyle} />
        </Source>
      )}
      {popupInfo && eventInfo && (
        <Popup
          longitude={popupInfo.lng}
          latitude={popupInfo.lat}
          closeButton={false}
          closeOnClick={false}
          anchor="bottom"
          offset={12}
          className="combat-popup"
        >
          <div className="px-2.5 py-2 w95-font">
            <div className="flex items-center gap-1.5 mb-1">
              <span
                className="inline-block h-2.5 w-2.5"
                style={{ backgroundColor: eventInfo.color }}
              />
              <span className="font-bold text-[11px] text-black">
                {eventInfo.label}
              </span>
            </div>
            <p className="text-[10px] text-[#404040] leading-relaxed max-w-[220px]">
              {popupInfo.description}
            </p>
          </div>
        </Popup>
      )}
    </>
  );
}
