"use client";

import { useEffect, useRef } from "react";
import { useStore } from "@/stores";
import type { BattleData } from "@/types";

export function useBattleData(data: BattleData) {
  const setBattleData = useStore((s) => s.setBattleData);
  const hasHydrated = useRef(false);

  useEffect(() => {
    if (!hasHydrated.current) {
      setBattleData(data);
      hasHydrated.current = true;
    }
  }, [data, setBattleData]);
}
