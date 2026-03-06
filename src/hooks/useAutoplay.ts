"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/stores";

const SPEED_DELAYS: Record<number, number> = {
  1: 4000,
  2: 2000,
  4: 1000,
};

export function useAutoplay() {
  const isPlaying = useStore((s) => s.isPlaying);
  const isAnimating = useStore((s) => s.isAnimating);
  const playbackSpeed = useStore((s) => s.playbackSpeed);
  const currentStep = useStore((s) => s.currentStep);
  const timeline = useStore((s) => s.timeline);
  const stepForward = useStore((s) => s.stepForward);
  const setPlaying = useStore((s) => s.setPlaying);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    // Don't advance while animation is in progress
    if (isAnimating) return;

    // Stop at last stage
    if (currentStep >= timeline.length - 1) {
      setPlaying(false);
      return;
    }

    const delay = SPEED_DELAYS[playbackSpeed] ?? 4000;
    timerRef.current = setTimeout(() => {
      stepForward(timeline.length);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isPlaying, isAnimating, playbackSpeed, currentStep, timeline.length, stepForward, setPlaying]);
}
