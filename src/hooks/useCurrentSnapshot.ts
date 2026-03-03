"use client";

import { useMemo } from "react";
import { useStore } from "@/stores";
import type { TimelineSnapshot } from "@/types";

export function useCurrentSnapshot(): TimelineSnapshot | null {
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);

  return useMemo(() => {
    if (timeline.length === 0) return null;
    return timeline[currentStep] ?? null;
  }, [timeline, currentStep]);
}

export function usePreviousSnapshot(): TimelineSnapshot | null {
  const timeline = useStore((s) => s.timeline);
  const previousStep = useStore((s) => s.previousStep);

  return useMemo(() => {
    if (timeline.length === 0) return null;
    return timeline[previousStep] ?? null;
  }, [timeline, previousStep]);
}
