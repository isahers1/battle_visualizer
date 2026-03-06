"use client";

import { useState, useCallback, useEffect } from "react";
import Map, { useMap, type ViewStateChangeEvent } from "react-map-gl/maplibre";
import { useStore } from "@/stores";
import { openTopoMapStyle } from "@/lib/mapStyle";
import { MAP_CONSTRAINTS } from "@/lib/zoomConfig";
import { UnitLayer } from "./UnitLayer";
import { TerrainLayer } from "./TerrainLayer";
import { FortificationLayer } from "./FortificationLayer";
import { MovementTrailLayer } from "./MovementTrailLayer";
import { WeatherOverlay } from "./WeatherOverlay";
import { DaylightOverlay } from "./DaylightOverlay";
import { CombatEventLayer } from "./CombatEventLayer";
import { ZoomHintLayer } from "./ZoomHintLayer";
import { FrontLineLayer } from "./FrontLineLayer";
import { useCameraFollow } from "@/hooks/useCameraFollow";
import { IntroSequence } from "@/components/panels/IntroSequence";

function CameraFollowController() {
  useCameraFollow();
  return null;
}

function ViewportBoundsSync() {
  const { current: mapRef } = useMap();
  const setViewportBounds = useStore((s) => s.setViewportBounds);

  useEffect(() => {
    if (!mapRef) return;
    const map = mapRef.getMap();

    function syncBounds() {
      const b = map.getBounds();
      setViewportBounds({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    }

    // Sync on initial load
    if (map.loaded()) {
      syncBounds();
    } else {
      map.once("load", syncBounds);
    }

    map.on("move", syncBounds);
    return () => {
      map.off("move", syncBounds);
    };
  }, [mapRef, setViewportBounds]);

  return null;
}

export function BattleMap() {
  const viewport = useStore((s) => s.viewport);
  const metadata = useStore((s) => s.metadata);
  const setViewport = useStore((s) => s.setViewport);
  const [showIntro, setShowIntro] = useState(() => {
    if (typeof window === "undefined") return false;
    return !localStorage.getItem("battle-visualizer-intro-seen");
  });

  const onMove = useCallback(
    (evt: ViewStateChangeEvent) => {
      let { longitude, latitude } = evt.viewState;

      // Clamp the center so users can't scroll too far from the battle area
      if (metadata) {
        const lonPad = 1.0;
        const latPad = 0.75;
        longitude = Math.max(metadata.bounds.west - lonPad, Math.min(metadata.bounds.east + lonPad, longitude));
        latitude = Math.max(metadata.bounds.south - latPad, Math.min(metadata.bounds.north + latPad, latitude));
      }

      setViewport({
        longitude,
        latitude,
        zoom: evt.viewState.zoom,
        bearing: evt.viewState.bearing,
        pitch: evt.viewState.pitch,
      });
    },
    [setViewport, metadata]
  );

  return (
    <Map
      {...viewport}
      onMove={onMove}
      style={{ width: "100%", height: "100%" }}
      mapStyle={openTopoMapStyle}
      minZoom={MAP_CONSTRAINTS.minZoom}
      maxZoom={MAP_CONSTRAINTS.maxZoom}
      attributionControl={false}
    >
      <ViewportBoundsSync />
      <CameraFollowController />
      <FrontLineLayer />
      <TerrainLayer />
      <FortificationLayer />
      <MovementTrailLayer />
      <WeatherOverlay />
      <DaylightOverlay />
      <CombatEventLayer />
      <ZoomHintLayer />
      <UnitLayer />
      {showIntro && <IntroSequence onComplete={() => setShowIntro(false)} />}
    </Map>
  );
}
