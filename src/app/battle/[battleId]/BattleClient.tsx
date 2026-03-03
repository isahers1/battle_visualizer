"use client";

import { useBattleData } from "@/hooks/useBattleData";
import { useAnimatedTransition } from "@/hooks/useAnimatedTransition";
import { useStore } from "@/stores";
import { BattleMap } from "@/components/map/BattleMap";
import { BattleHeader } from "@/components/panels/BattleHeader";
import { TimelineControls } from "@/components/panels/TimelineControls";
import { UnitTooltip } from "@/components/panels/UnitTooltip";
import { UnitDetailPanel } from "@/components/panels/UnitDetailPanel";
import { CasualtyTracker } from "@/components/panels/CasualtyTracker";
import { WeatherIndicator } from "@/components/panels/WeatherIndicator";
import { TimeOfDayIndicator } from "@/components/panels/TimeOfDayIndicator";
import { MapLegend } from "@/components/panels/MapLegend";
import type { BattleData } from "@/types";

interface BattleClientProps {
  data: BattleData;
}

export function BattleClient({ data }: BattleClientProps) {
  useBattleData(data);
  useAnimatedTransition();
  const isLoaded = useStore((s) => s.isLoaded);

  if (!isLoaded) {
    return (
      <div className="flex h-screen w-screen items-center justify-center bg-stone-100">
        <div className="text-lg text-stone-500">Loading battle data...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-screen overflow-hidden scanlines">
      <BattleMap />
      <BattleHeader />
      <UnitTooltip />
      <UnitDetailPanel />
      <div className="absolute bottom-4 left-4 z-10 flex flex-col gap-2">
        <WeatherIndicator />
        <TimeOfDayIndicator />
      </div>
      <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-2">
        <CasualtyTracker />
      </div>
      <MapLegend />
      <TimelineControls />
    </div>
  );
}
