"use client";

import { useMemo } from "react";
import { useCurrentSnapshot } from "./useCurrentSnapshot";
import { calculateDaylightState } from "@/lib/daylightCalculator";
import type { DaylightState } from "@/types";

export function useDaylightState(): DaylightState | null {
  const snapshot = useCurrentSnapshot();

  return useMemo(() => {
    if (!snapshot) return null;
    return calculateDaylightState(snapshot.dateTime);
  }, [snapshot]);
}
