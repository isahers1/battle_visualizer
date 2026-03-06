"use client";

import { useEffect, useRef } from "react";
import { useMap } from "react-map-gl/maplibre";
import { useStore } from "@/stores";

export function useCameraFollow() {
  const { current: mapRef } = useMap();
  const currentStep = useStore((s) => s.currentStep);
  const timeline = useStore((s) => s.timeline);
  const units = useStore((s) => s.units);
  const isCameraFollowEnabled = useStore((s) => s.isCameraFollowEnabled);
  const prevStepRef = useRef(currentStep);

  useEffect(() => {
    if (!isCameraFollowEnabled || !mapRef || prevStepRef.current === currentStep) {
      prevStepRef.current = currentStep;
      return;
    }
    prevStepRef.current = currentStep;

    const snapshot = timeline[currentStep];
    if (!snapshot) return;

    // Compute centroid from combat events first, fall back to moved units
    let lngs: number[] = [];
    let lats: number[] = [];

    if (snapshot.combatEvents.length > 0) {
      for (const event of snapshot.combatEvents) {
        lngs.push(event.fromPosition[0], event.toPosition[0]);
        lats.push(event.fromPosition[1], event.toPosition[1]);
      }
    } else {
      // Use units that changed position from previous step
      const prevSnapshot = timeline[currentStep - 1];
      if (prevSnapshot) {
        for (const [unitId, state] of Object.entries(snapshot.unitStates)) {
          const prevState = prevSnapshot.unitStates[unitId];
          if (prevState && (prevState.position[0] !== state.position[0] || prevState.position[1] !== state.position[1])) {
            lngs.push(state.position[0]);
            lats.push(state.position[1]);
          }
        }
      }
    }

    if (lngs.length === 0) return;

    const centerLng = lngs.reduce((a, b) => a + b, 0) / lngs.length;
    const centerLat = lats.reduce((a, b) => a + b, 0) / lats.length;

    const map = mapRef.getMap();
    map.flyTo({
      center: [centerLng, centerLat],
      duration: 600,
    });
  }, [currentStep, timeline, units, isCameraFollowEnabled, mapRef]);
}
