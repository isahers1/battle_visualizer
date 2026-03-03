"use client";

import { useMemo } from "react";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

export function CasualtyTracker() {
  const units = useStore((s) => s.units);
  const snapshot = useCurrentSnapshot();

  const totals = useMemo(() => {
    if (!snapshot) return null;

    const allied = { killed: 0, wounded: 0, captured: 0, missing: 0 };
    const axis = { killed: 0, wounded: 0, captured: 0, missing: 0 };

    for (const [unitId, state] of Object.entries(snapshot.unitStates)) {
      const unit = units[unitId];
      if (!unit) continue;
      const target = unit.side === "allied" ? allied : axis;
      target.killed += state.casualties.killed;
      target.wounded += state.casualties.wounded;
      target.captured += state.casualties.captured;
      target.missing += state.casualties.missing;
    }

    return { allied, axis };
  }, [units, snapshot]);

  if (!totals) return null;

  const alliedTotal =
    totals.allied.killed +
    totals.allied.wounded +
    totals.allied.captured +
    totals.allied.missing;
  const axisTotal =
    totals.axis.killed +
    totals.axis.wounded +
    totals.axis.captured +
    totals.axis.missing;

  return (
    <div className="w95-raised w95-font p-0">
      <div className="w95-titlebar text-[10px]">
        <span className="mr-1">&#9760;</span>
        Casualties
      </div>
      <div className="p-2">
        <div className="flex gap-3">
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <div className="h-[8px] w-[8px]" style={{ background: "#000080" }} />
              <span className="text-[10px] text-[#404040]">Allied</span>
            </div>
            <div className="w95-sunken px-2 py-0.5 text-center">
              <span className="text-[12px] font-bold text-black font-mono">
                {alliedTotal.toLocaleString()}
              </span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-0.5">
              <div className="h-[8px] w-[8px]" style={{ background: "#cc0000" }} />
              <span className="text-[10px] text-[#404040]">Axis</span>
            </div>
            <div className="w95-sunken px-2 py-0.5 text-center">
              <span className="text-[12px] font-bold text-black font-mono">
                {axisTotal.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
