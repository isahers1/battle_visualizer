"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/stores";
import { ANIMATION_DURATION, easeInOutCubic } from "@/lib/animationUtils";

export function useAnimatedTransition() {
  const setAnimating = useStore((s) => s.setAnimating);
  const setAnimationProgress = useStore((s) => s.setAnimationProgress);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Track the current step to trigger animation on change
  const currentStep = useStore((s) => s.currentStep);
  const animationDirection = useStore((s) => s.animationDirection);

  useEffect(() => {
    if (animationDirection !== "forward") {
      return;
    }

    setAnimating(true);
    setAnimationProgress(0);
    startTimeRef.current = performance.now();

    function animate(now: number) {
      const elapsed = now - startTimeRef.current;
      const rawProgress = Math.min(elapsed / ANIMATION_DURATION, 1);
      const easedProgress = easeInOutCubic(rawProgress);

      setAnimationProgress(easedProgress);

      if (rawProgress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      } else {
        setAnimating(false);
      }
    }

    rafRef.current = requestAnimationFrame(animate);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
    // Only re-run when currentStep changes (triggers a new animation)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentStep]);
}
