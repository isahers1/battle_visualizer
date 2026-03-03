"use client";

import { useCallback } from "react";
import Map, { type ViewStateChangeEvent } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { openTopoMapStyle } from "@/lib/mapStyle";
import { MAP_CONSTRAINTS } from "@/lib/zoomConfig";
import { UnitLayer } from "./UnitLayer";
import { TerrainLayer } from "./TerrainLayer";
import { FortificationLayer } from "./FortificationLayer";
import { WeatherOverlay } from "./WeatherOverlay";
import { DaylightOverlay } from "./DaylightOverlay";
import { CombatEventLayer } from "./CombatEventLayer";
import { ZoomHintLayer } from "./ZoomHintLayer";

export function BattleMap() {
  const viewport = useStore((s) => s.viewport);
  const metadata = useStore((s) => s.metadata);
  const setViewport = useStore((s) => s.setViewport);

  const onMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      setViewport({
        longitude: evt.viewState.longitude,
        latitude: evt.viewState.latitude,
        zoom: evt.viewState.zoom,
        bearing: evt.viewState.bearing,
        pitch: evt.viewState.pitch,
      });
    },
    [setViewport]
  );

  const maxBounds = metadata
    ? ([
        [metadata.bounds.west - 0.3, metadata.bounds.south - 0.2],
        [metadata.bounds.east + 0.3, metadata.bounds.north + 0.2],
      ] as [[number, number], [number, number]])
    : undefined;

  return (
    <Map
      {...viewport}
      onMove={onMove}
      style={{ width: "100%", height: "100%" }}
      mapStyle={openTopoMapStyle}
      minZoom={MAP_CONSTRAINTS.minZoom}
      maxZoom={MAP_CONSTRAINTS.maxZoom}
      maxBounds={maxBounds}
      attributionControl={false}
    >
      <TerrainLayer />
      <FortificationLayer />
      <WeatherOverlay />
      <DaylightOverlay />
      <CombatEventLayer />
      <ZoomHintLayer />
      <UnitLayer />
    </Map>
  );
}
