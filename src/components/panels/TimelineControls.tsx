"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

const WEATHER_LABELS: Record<string, string> = {
  clear: "Clear",
  overcast: "Overcast",
  rain: "Rain",
  snow: "Snow",
  fog: "Fog",
  blizzard: "Blizzard",
};

export function TimelineControls() {
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);
  const isAnimating = useStore((s) => s.isAnimating);
  const stepForward = useStore((s) => s.stepForward);
  const stepBackward = useStore((s) => s.stepBackward);
  const setStep = useStore((s) => s.setStep);
  const snapshot = useCurrentSnapshot();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const totalSteps = timeline.length;
  const canGoBack = currentStep > 0;
  const canGoForward = currentStep < totalSteps - 1;

  const handleBack = useCallback(() => {
    if (!isAnimating && canGoBack) stepBackward();
  }, [isAnimating, canGoBack, stepBackward]);

  const handleForward = useCallback(() => {
    if (!isAnimating && canGoForward) stepForward(totalSteps);
  }, [isAnimating, canGoForward, stepForward, totalSteps]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        handleBack();
      } else if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        handleForward();
      } else if (e.key === "d" || e.key === "D") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        setDetailsOpen((prev) => !prev);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleBack, handleForward]);

  if (totalSteps === 0) return null;

  const weatherLabel = snapshot?.weather?.condition
    ? WEATHER_LABELS[snapshot.weather.condition] ?? snapshot.weather.condition
    : null;

  const stageDate = snapshot
    ? new Date(snapshot.dateTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 w95-font flex flex-col items-center">
      {/* Expandable details panel */}
      <AnimatePresence>
        {detailsOpen && snapshot && (
          <motion.div
            initial={{ opacity: 0, y: 10, scaleY: 0.95 }}
            animate={{ opacity: 1, y: 0, scaleY: 1 }}
            exit={{ opacity: 0, y: 10, scaleY: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-[520px] mb-1 w95-raised p-0 origin-bottom"
          >
            <div className="w95-titlebar text-[10px]">
              <span className="mr-1">&#128196;</span>
              Stage Details — {snapshot.title}
              <button
                onClick={() => setDetailsOpen(false)}
                className="w95-btn !p-0 !min-h-[14px] w-[14px] ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px]"
              >
                &#x2715;
              </button>
            </div>

            <div className="p-2 overflow-y-auto max-h-[280px]">
              <div className="space-y-2">
                {/* Description */}
                {snapshot.description && (
                  <div className="w95-sunken p-2">
                    <p className="text-[11px] text-black leading-relaxed">
                      {snapshot.description}
                    </p>
                  </div>
                )}

                {/* Significance */}
                {snapshot.significance && (
                  <div className="w95-groupbox">
                    <span className="w95-groupbox-label">Significance</span>
                    <p className="text-[11px] text-[#000080] font-bold leading-relaxed mt-1">
                      {snapshot.significance}
                    </p>
                  </div>
                )}

                {/* Key Events */}
                {snapshot.details && snapshot.details.length > 0 && (
                  <div className="w95-groupbox">
                    <span className="w95-groupbox-label">Key Events</span>
                    <ul className="mt-1 space-y-0.5">
                      {snapshot.details.map((detail, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <span className="text-[10px] text-[#808080] mt-[1px] flex-shrink-0">&#9654;</span>
                          <span className="text-[11px] text-black leading-relaxed">{detail}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Combat Events */}
                {snapshot.combatEvents && snapshot.combatEvents.length > 0 && (
                  <div className="w95-groupbox">
                    <span className="w95-groupbox-label">Combat Events</span>
                    <ul className="mt-1 space-y-0.5">
                      {snapshot.combatEvents.map((event) => (
                        <li key={event.id} className="flex items-start gap-1.5">
                          <span className="text-[10px] text-[#cc0000] mt-[1px] flex-shrink-0">&#9679;</span>
                          <span className="text-[11px] text-black leading-relaxed">{event.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Weather */}
                {weatherLabel && (
                  <div className="w95-groupbox">
                    <span className="w95-groupbox-label">Weather</span>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-[11px] text-black">{weatherLabel}</span>
                      {snapshot.weather.temperature != null && (
                        <span className="text-[11px] text-[#404040]">
                          {snapshot.weather.temperature}&deg;C
                        </span>
                      )}
                      {snapshot.weather.visibility && (
                        <span className="text-[11px] text-[#404040]">
                          Visibility: {snapshot.weather.visibility.replace("_", " ")}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Statusbar */}
            <div className="flex text-[10px] border-t border-[#808080]" style={{ background: "#c0c0c0" }}>
              <div className="w95-statusbar-cell flex-1">
                {stageDate}
              </div>
              <div className="w95-statusbar-cell">
                Step {currentStep + 1} of {totalSteps}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main controls */}
      <div className="w95-raised p-0">
        <div className="w95-titlebar text-[10px]">
          <span className="mr-1">&#9654;</span>
          Timeline Control
          <button
            onClick={() => setDetailsOpen((p) => !p)}
            className={`w95-btn !p-0 !min-h-[14px] px-1 ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px] ${detailsOpen ? "!border-[#808080_#ffffff_#ffffff_#808080] !shadow-[inset_1px_1px_0_#808080,inset_-1px_-1px_0_#ffffff]" : ""}`}
            title="Toggle stage details (D)"
          >
            Details
          </button>
        </div>
        <div className="p-1.5">
          {/* Step title */}
          <div className="w95-sunken px-2 py-1 mb-1.5 text-center">
            <span className="text-[11px] font-bold text-black">
              {snapshot?.title ?? ""}
            </span>
          </div>

          <div className="flex items-center gap-1">
            <button
              className="w95-btn"
              onClick={handleBack}
              disabled={!canGoBack || isAnimating}
              aria-label="Previous step"
            >
              &#9668; Prev
            </button>

            {/* Step dots as a sunken "track" */}
            <div className="w95-sunken flex-1 flex items-center justify-center gap-[3px] px-2 py-1">
              {timeline.map((_, i) => (
                <button
                  key={i}
                  onClick={() => !isAnimating && setStep(i)}
                  className="h-[6px] w-[6px] transition-colors"
                  style={{
                    background:
                      i === currentStep
                        ? "#000080"
                        : i < currentStep
                          ? "#808080"
                          : "#c0c0c0",
                    border:
                      i === currentStep
                        ? "1px solid #000040"
                        : "1px solid #808080",
                  }}
                  aria-label={`Go to step ${i + 1}`}
                />
              ))}
            </div>

            <button
              className="w95-btn"
              onClick={handleForward}
              disabled={!canGoForward || isAnimating}
              aria-label="Next step"
            >
              Next &#9658;
            </button>
          </div>

          {/* Status bar */}
          <div className="w95-statusbar mt-1.5 -mx-1.5 -mb-1.5">
            <div className="w95-statusbar-cell flex-1">
              Step {currentStep + 1} of {totalSteps}
            </div>
            <div className="w95-statusbar-cell">
              {isAnimating ? "Animating..." : detailsOpen ? "Press D to close" : "Press D for details"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
