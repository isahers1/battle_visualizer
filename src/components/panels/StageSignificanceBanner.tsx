"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

export function StageSignificanceBanner() {
  const snapshot = useCurrentSnapshot();
  const [displayedText, setDisplayedText] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const typewriterRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const significance = snapshot?.significance;
  const stageIndex = snapshot?.index;

  // Typewriter effect + auto-fade
  useEffect(() => {
    // Clear previous timers
    if (timerRef.current) clearTimeout(timerRef.current);
    if (typewriterRef.current) clearInterval(typewriterRef.current);

    if (!significance) {
      setIsVisible(false);
      setDisplayedText("");
      return;
    }

    setIsDismissed(false);
    setIsVisible(true);
    setDisplayedText("");

    let charIndex = 0;
    const chars = significance;
    const intervalMs = Math.min(1500 / chars.length, 30);

    typewriterRef.current = setInterval(() => {
      charIndex++;
      setDisplayedText(chars.slice(0, charIndex));
      if (charIndex >= chars.length) {
        if (typewriterRef.current) clearInterval(typewriterRef.current);
      }
    }, intervalMs);

    // Auto-fade after 5s from start
    timerRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (typewriterRef.current) clearInterval(typewriterRef.current);
    };
  }, [stageIndex, significance]);

  if (!significance || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key={stageIndex}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-[160px] left-1/2 -translate-x-1/2 z-10 max-w-[520px] cursor-pointer"
          onClick={() => {
            setIsDismissed(true);
            setIsVisible(false);
          }}
        >
          <div className="w95-raised p-0 w95-font">
            <div className="w95-titlebar text-[10px]">
              <span className="mr-1">&#9888;</span>
              Strategic Significance
            </div>
            <div className="px-3 py-2">
              <p className="text-[11px] text-[#000080] font-bold leading-relaxed">
                {displayedText}
                <span className="animate-pulse">&#9608;</span>
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
