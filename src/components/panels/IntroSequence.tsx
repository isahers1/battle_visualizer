"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores";
import { useMap } from "react-map-gl/maplibre";

interface IntroSequenceProps {
  onComplete: () => void;
}

type Phase = "title" | "bastogne" | "stvith" | "malmedy" | "pullback" | "done";

const LOCATIONS = {
  bastogne: { lng: 5.72, lat: 49.99, zoom: 11, label: "Bastogne", subtitle: "The Siege" },
  stvith: { lng: 6.12, lat: 50.28, zoom: 11, label: "St. Vith", subtitle: "The Roadblock" },
  malmedy: { lng: 6.03, lat: 50.42, zoom: 11, label: "Malmedy", subtitle: "The Massacre" },
  pullback: { lng: 5.95, lat: 50.15, zoom: 9, label: "", subtitle: "" },
} as const;

const PHASE_ORDER: Phase[] = ["title", "bastogne", "stvith", "malmedy", "pullback", "done"];

export function IntroSequence({ onComplete }: IntroSequenceProps) {
  const [phase, setPhase] = useState<Phase>("title");
  const { current: mapRef } = useMap();
  const setViewport = useStore((s) => s.setViewport);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const skip = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    localStorage.setItem("battle-visualizer-intro-seen", "true");
    // Reset to default view
    setViewport({ longitude: 5.95, latitude: 50.15, zoom: 9, bearing: 0, pitch: 0 });
    onComplete();
  }, [onComplete, setViewport]);

  const flyTo = useCallback(
    (loc: { lng: number; lat: number; zoom: number }) => {
      if (mapRef) {
        mapRef.flyTo({
          center: [loc.lng, loc.lat],
          zoom: loc.zoom,
          duration: 1500,
          essential: true,
        });
      }
      setViewport({
        longitude: loc.lng,
        latitude: loc.lat,
        zoom: loc.zoom,
      });
    },
    [mapRef, setViewport]
  );

  // Phase progression
  useEffect(() => {
    if (phase === "done") return;

    let delay: number;
    if (phase === "title") {
      delay = 3000;
    } else if (phase === "pullback") {
      delay = 1500;
    } else {
      delay = 3500; // fly (1.5s) + hold (2s)
    }

    timerRef.current = setTimeout(() => {
      const nextIndex = PHASE_ORDER.indexOf(phase) + 1;
      const nextPhase = PHASE_ORDER[nextIndex];

      if (nextPhase === "done") {
        localStorage.setItem("battle-visualizer-intro-seen", "true");
        onComplete();
        return;
      }

      setPhase(nextPhase);

      // Trigger camera fly
      if (nextPhase in LOCATIONS) {
        flyTo(LOCATIONS[nextPhase as keyof typeof LOCATIONS]);
      }
    }, delay);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [phase, flyTo, onComplete]);

  // Skip on click or keypress
  useEffect(() => {
    const handleKey = () => skip();
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [skip]);

  const currentLocation =
    phase !== "title" && phase !== "done" && phase !== "pullback"
      ? LOCATIONS[phase]
      : null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] cursor-pointer"
        onClick={skip}
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Dark overlay */}
        <motion.div
          className="absolute inset-0 bg-black"
          initial={{ opacity: 0.85 }}
          animate={{ opacity: phase === "pullback" ? 0 : 0.7 }}
          transition={{ duration: 1 }}
        />

        {/* Title card */}
        <AnimatePresence>
          {phase === "title" && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center">
                {/* Win95 wizard-style panel */}
                <div className="w95-raised p-0 inline-block">
                  <div className="w95-titlebar gap-2 px-3">
                    <span className="text-[10px]">&#9733;</span>
                    <span>Welcome to Battle Visualizer</span>
                  </div>
                  <div className="p-6 max-w-lg">
                    <div className="w95-font text-[24px] font-bold text-black tracking-tight mb-3">
                      Battle of the Bulge
                    </div>
                    <div className="w95-sunken p-3 mb-3">
                      <div className="w95-font text-[13px] text-[#000080] font-bold">
                        December 16, 1944 &mdash; January 25, 1945
                      </div>
                    </div>
                    <p className="w95-font text-[11px] text-black leading-relaxed mb-4">
                      The last major German offensive on the Western Front
                    </p>
                    <div className="w95-progress mb-3">
                      <motion.div
                        className="w95-progress-fill"
                        initial={{ width: "0%" }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 2.5, ease: "linear" }}
                      />
                    </div>
                    <p className="w95-font text-[10px] text-[#808080]">
                      Loading historical data...
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Location card */}
        <AnimatePresence>
          {currentLocation && (
            <motion.div
              key={phase}
              className="absolute inset-0 flex items-center justify-center pointer-events-none"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4, delay: 0.8 }}
            >
              <div className="w95-raised p-0 inline-block">
                <div className="w95-titlebar gap-2 px-3">
                  <span className="text-[10px]">&#128205;</span>
                  <span>Location</span>
                </div>
                <div className="p-5 text-center">
                  <div className="w95-font text-[20px] font-bold text-black mb-1">
                    {currentLocation.label}
                  </div>
                  <div className="w95-font text-[13px] text-[#000080] italic">
                    &mdash; {currentLocation.subtitle} &mdash;
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Skip hint */}
        {phase !== "pullback" && (
          <motion.div
            className="absolute bottom-6 left-1/2 -translate-x-1/2 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 1 }}
          >
            <span className="w95-font text-[11px] text-white">
              Click anywhere or press any key to skip
            </span>
          </motion.div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
