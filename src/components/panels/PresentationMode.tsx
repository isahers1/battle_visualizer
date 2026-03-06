"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useStore } from "@/stores";

interface PresentationModeProps {
  isActive: boolean;
  onExit: () => void;
}

type PresentationPhase = "shutdown" | "playing" | "ending" | "restarting";

function TypewriterText({ text, speed = 40 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(interval);
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

export function PresentationMode({ isActive, onExit }: PresentationModeProps) {
  const [phase, setPhase] = useState<PresentationPhase>("shutdown");
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [showTitle, setShowTitle] = useState(false);
  const [showSignificance, setShowSignificance] = useState(false);

  const timeline = useStore((s) => s.timeline);
  const setStep = useStore((s) => s.setStep);
  const setPlaying = useStore((s) => s.setPlaying);
  const setViewport = useStore((s) => s.setViewport);

  // Separate timer refs to avoid cross-effect interference
  const phaseTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageTimersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const stageCount = timeline.length;

  // Compute stage centroids from combat events
  const stageCentroids = useMemo(() => {
    return timeline.map((snapshot) => {
      const events = snapshot.combatEvents;
      if (events.length === 0) {
        const states = Object.values(snapshot.unitStates);
        if (states.length === 0) return { lng: 5.95, lat: 50.15 };
        const sumLng = states.reduce((s, u) => s + u.position[0], 0);
        const sumLat = states.reduce((s, u) => s + u.position[1], 0);
        return { lng: sumLng / states.length, lat: sumLat / states.length };
      }
      let lngSum = 0;
      let latSum = 0;
      let count = 0;
      for (const evt of events) {
        lngSum += evt.fromPosition[0];
        latSum += evt.fromPosition[1];
        count++;
        if (evt.toPosition) {
          lngSum += evt.toPosition[0];
          latSum += evt.toPosition[1];
          count++;
        }
      }
      return { lng: lngSum / count, lat: latSum / count };
    });
  }, [timeline]);

  // Phase transition timer (shutdown -> playing, ending -> restarting, restarting -> exit)
  useEffect(() => {
    if (!isActive) return;

    if (phase === "shutdown") {
      phaseTimerRef.current = setTimeout(() => {
        setPhase("playing");
        setCurrentStageIndex(0);
      }, 1500);
    } else if (phase === "ending") {
      phaseTimerRef.current = setTimeout(() => setPhase("restarting"), 3000);
    } else if (phase === "restarting") {
      phaseTimerRef.current = setTimeout(() => onExit(), 1500);
    }

    return () => {
      if (phaseTimerRef.current) {
        clearTimeout(phaseTimerRef.current);
        phaseTimerRef.current = null;
      }
    };
  }, [isActive, phase, onExit]);

  // Per-stage sequence: flyTo -> title -> significance -> hold -> advance
  useEffect(() => {
    if (!isActive || phase !== "playing") return;

    // Clear only stage timers
    for (const t of stageTimersRef.current) clearTimeout(t);
    stageTimersRef.current = [];

    setShowTitle(false);
    setShowSignificance(false);
    setStep(currentStageIndex);
    setPlaying(false);

    // Fly camera to stage centroid
    const centroid = stageCentroids[currentStageIndex];
    if (centroid) {
      setViewport({ longitude: centroid.lng, latitude: centroid.lat, zoom: 10 });
    }

    // Chain: camera fly (800ms) -> show title -> 400ms -> show significance -> 5s -> advance
    const t1 = setTimeout(() => {
      setShowTitle(true);

      const t2 = setTimeout(() => {
        setShowSignificance(true);

        const t3 = setTimeout(() => {
          setShowTitle(false);
          setShowSignificance(false);

          const nextIndex = currentStageIndex + 1;
          if (nextIndex >= stageCount) {
            setPhase("ending");
          } else {
            setCurrentStageIndex(nextIndex);
          }
        }, 5000);
        stageTimersRef.current.push(t3);
      }, 400);
      stageTimersRef.current.push(t2);
    }, 800);
    stageTimersRef.current.push(t1);

    return () => {
      for (const t of stageTimersRef.current) clearTimeout(t);
      stageTimersRef.current = [];
    };
  }, [isActive, phase, currentStageIndex, stageCount, stageCentroids, setStep, setPlaying, setViewport]);

  // Escape to exit
  useEffect(() => {
    if (!isActive) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        // Clear all timers
        if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current);
        for (const t of stageTimersRef.current) clearTimeout(t);
        stageTimersRef.current = [];
        setPhase("restarting");
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isActive]);

  // Reset state when deactivated
  useEffect(() => {
    if (!isActive) {
      setPhase("shutdown");
      setCurrentStageIndex(0);
      setShowTitle(false);
      setShowSignificance(false);
    }
  }, [isActive]);

  if (!isActive) return null;

  const currentSnapshot = timeline[currentStageIndex];
  const progress = stageCount > 0 ? ((currentStageIndex + 1) / stageCount) * 100 : 0;
  const currentDate = currentSnapshot
    ? new Date(currentSnapshot.dateTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="fixed inset-0 z-[200] pointer-events-none">
      <AnimatePresence mode="wait">
        {/* Shutdown screen */}
        {phase === "shutdown" && (
          <motion.div
            key="shutdown"
            className="absolute inset-0 bg-black flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <p className="w95-font text-white text-[14px] mb-3">
                Windows is shutting down...
              </p>
              <p className="w95-font text-[#808080] text-[11px]">
                Please wait while the presentation loads.
              </p>
            </div>
          </motion.div>
        )}

        {/* Restarting screen */}
        {phase === "restarting" && (
          <motion.div
            key="restarting"
            className="absolute inset-0 bg-black flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="text-center">
              <p className="w95-font text-white text-[14px] mb-3">
                Windows is restarting...
              </p>
              <p className="w95-font text-[#808080] text-[11px]">
                Returning to normal view.
              </p>
            </div>
          </motion.div>
        )}

        {/* End of battle screen */}
        {phase === "ending" && (
          <motion.div
            key="ending"
            className="absolute inset-0 flex items-center justify-center pointer-events-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="absolute inset-0 bg-black/80" />
            <div className="relative w95-raised p-0 inline-block">
              <div className="w95-titlebar gap-2 px-3">
                <span className="text-[10px]">&#9733;</span>
                <span>Presentation Complete</span>
              </div>
              <div className="p-8 text-center">
                <div className="w95-font text-[22px] font-bold text-black mb-2">
                  End of Battle
                </div>
                <div className="w95-sunken p-3 mb-4">
                  <p className="w95-font text-[11px] text-black leading-relaxed">
                    The Battle of the Bulge was the costliest action fought by the
                    U.S. Army in World War II. Germany&apos;s last gamble had failed.
                  </p>
                </div>
                <p className="w95-font text-[10px] text-[#808080]">
                  Returning to map view...
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Playing overlay: stage title card + progress */}
      {phase === "playing" && currentSnapshot && (
        <>
          {/* Stage title card */}
          <AnimatePresence>
            {showTitle && (
              <motion.div
                key={`title-${currentStageIndex}`}
                className="absolute top-8 left-1/2 -translate-x-1/2 z-[201]"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="w95-raised p-0 inline-block min-w-[300px]">
                  <div className="w95-titlebar gap-2 px-3">
                    <span className="text-[10px]">&#128196;</span>
                    <span>Stage {currentStageIndex + 1} of {stageCount}</span>
                  </div>
                  <div className="p-4 text-center">
                    <div className="w95-font text-[16px] font-bold text-black mb-1">
                      {currentSnapshot.title}
                    </div>
                    <div className="w95-font text-[11px] text-[#000080]">
                      {currentDate}
                    </div>
                    {showSignificance && currentSnapshot.significance && (
                      <motion.div
                        className="w95-sunken p-2 mt-3 text-left"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <p className="w95-font text-[11px] text-black leading-relaxed">
                          <TypewriterText text={currentSnapshot.significance} speed={30} />
                        </p>
                      </motion.div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress bar at bottom */}
          <div className="absolute bottom-0 left-0 right-0 h-[6px] bg-black/30 z-[201]">
            <motion.div
              className="h-full"
              style={{ background: "linear-gradient(90deg, #000080, #1084d0)" }}
              initial={{ width: "0%" }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          </div>

          {/* Escape hint */}
          <div className="absolute bottom-4 right-4 z-[201]">
            <span className="w95-font text-[10px] text-white/60">
              Press Escape to exit
            </span>
          </div>
        </>
      )}
    </div>
  );
}
