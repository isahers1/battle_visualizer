"use client";

import { useRef, useLayoutEffect, useState } from "react";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

const STATUS_COLORS: Record<string, string> = {
  reserve: "#808080",
  moving: "#000080",
  engaged: "#cc6600",
  defending: "#006699",
  retreating: "#996600",
  destroyed: "#cc0000",
  surrendered: "#808080",
};

const OFFSET = 14;
const MARGIN = 8;

export function UnitTooltip() {
  const hoveredUnitId = useStore((s) => s.hoveredUnitId);
  const hoverPosition = useStore((s) => s.hoverPosition);
  const units = useStore((s) => s.units);
  const snapshot = useCurrentSnapshot();
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPos, setAdjustedPos] = useState<{ left: number; top: number } | null>(null);

  useLayoutEffect(() => {
    if (!hoverPosition || !tooltipRef.current) {
      setAdjustedPos(null);
      return;
    }

    const el = tooltipRef.current;
    const rect = el.getBoundingClientRect();
    const vw = window.innerWidth;
    const vh = window.innerHeight;

    let left = hoverPosition.x + OFFSET;
    let top = hoverPosition.y - 12;

    // Flip left if overflowing right edge
    if (left + rect.width + MARGIN > vw) {
      left = hoverPosition.x - rect.width - OFFSET;
    }

    // Flip up if overflowing bottom edge
    if (top + rect.height + MARGIN > vh) {
      top = hoverPosition.y - rect.height + 12;
    }

    // Clamp to viewport
    left = Math.max(MARGIN, Math.min(left, vw - rect.width - MARGIN));
    top = Math.max(MARGIN, Math.min(top, vh - rect.height - MARGIN));

    setAdjustedPos({ left, top });
  }, [hoverPosition]);

  if (!hoveredUnitId || !hoverPosition || !snapshot) return null;

  const unit = units[hoveredUnitId];
  const unitState = snapshot.unitStates[hoveredUnitId];
  if (!unit || !unitState) return null;

  const strengthColor =
    unitState.strength > 70
      ? "#008000"
      : unitState.strength > 40
        ? "#808000"
        : "#cc0000";

  const topEquipment = unit.equipment.slice(0, 3);

  return (
    <div
      ref={tooltipRef}
      className="pointer-events-none absolute z-20 w95-font"
      style={{
        left: adjustedPos?.left ?? (hoverPosition.x + OFFSET),
        top: adjustedPos?.top ?? (hoverPosition.y - 12),
        visibility: adjustedPos ? "visible" : "hidden",
      }}
    >
      <div className="w95-raised p-0 min-w-[200px]">
        {/* Titlebar with unit name */}
        <div
          className="w95-titlebar"
          style={{
            background:
              unit.side === "allied"
                ? "linear-gradient(90deg, #000080, #1084d0)"
                : "linear-gradient(90deg, #800000, #cc4444)",
          }}
        >
          <span className="truncate">{unit.name}</span>
        </div>

        <div className="p-2">
          {/* Type and echelon */}
          <div className="text-[10px] text-[#404040] capitalize">
            {unit.unitType} &middot;{" "}
            {unit.echelon.replace("_", " ")}
          </div>

          {/* Commander */}
          <div className="text-[10px] text-[#808080] italic">
            {unit.commander}
          </div>

          {/* Personnel */}
          {unit.personnel && (
            <div className="text-[10px] text-[#404040] mt-1">
              {(unit.personnel.officers + unit.personnel.ncos + unit.personnel.enlisted).toLocaleString()} men
              <span className="text-[#808080]">
                {" "}({unit.personnel.officers.toLocaleString()} officers)
              </span>
            </div>
          )}

          {/* Strength — Win95 progress bar */}
          <div className="mt-1.5 flex items-center gap-1.5">
            <span className="text-[10px] text-[#404040] w-[46px]">
              Strength
            </span>
            <div className="w95-progress flex-1">
              <div
                className="h-full"
                style={{
                  width: `${unitState.strength}%`,
                  background: `repeating-linear-gradient(90deg, ${strengthColor} 0px, ${strengthColor} 8px, transparent 8px, transparent 10px)`,
                }}
              />
            </div>
            <span className="text-[10px] font-bold text-black w-[28px] text-right">
              {unitState.strength}%
            </span>
          </div>

          {/* Status */}
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-[10px] text-[#404040] w-[46px]">
              Status
            </span>
            <span
              className="text-[10px] font-bold capitalize"
              style={{ color: STATUS_COLORS[unitState.status] ?? "#404040" }}
            >
              {unitState.status}
            </span>
          </div>

          {/* Equipment preview */}
          {topEquipment.length > 0 && (
            <div className="mt-1.5 border-t border-[#808080] pt-1">
              <div className="text-[9px] font-bold text-[#808080] uppercase tracking-wider mb-0.5">
                Equipment
              </div>
              {topEquipment.map((eq, i) => (
                <div key={i} className="flex justify-between text-[10px]">
                  <span className="text-black">{eq.name}</span>
                  <span className="text-[#808080] ml-2 font-mono">x{eq.quantity.toLocaleString()}</span>
                </div>
              ))}
              {unit.equipment.length > 3 && (
                <div className="text-[9px] text-[#808080] italic">
                  +{unit.equipment.length - 3} more...
                </div>
              )}
            </div>
          )}

          <div className="mt-1.5 text-[9px] text-[#808080] text-center border-t border-[#c0c0c0] pt-1">
            Click for details
          </div>
        </div>
      </div>
    </div>
  );
}
