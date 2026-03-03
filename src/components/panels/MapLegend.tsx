"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useStore } from "@/stores";
import type { UnitType } from "@/types";

function LegendIcon({
  unitType,
  label,
}: {
  unitType: UnitType;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <img
        src={`/icons/units/allied-${unitType}.svg`}
        alt={unitType}
        className="flex-shrink-0"
        style={{ width: 22, height: "auto" }}
      />
      <span className="text-[11px] text-black">{label}</span>
    </div>
  );
}

const UNIT_TYPES_LEGEND: [UnitType, string][] = [
  ["infantry", "Infantry"],
  ["armor", "Armor"],
  ["artillery", "Artillery"],
  ["airborne", "Airborne"],
  ["cavalry", "Cavalry / Recon"],
  ["mechanized", "Mechanized"],
  ["headquarters", "Headquarters"],
  ["engineer", "Engineer"],
];

const ECHELON_LEGEND: [string, string][] = [
  ["XX", "Division"],
  ["XXX", "Corps"],
  ["XXXX", "Army"],
];

export function MapLegend() {
  const isOpen = useStore((s) => s.isLegendOpen);
  const toggleLegend = useStore((s) => s.toggleLegend);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "l" || e.key === "L") {
        if (
          e.target instanceof HTMLInputElement ||
          e.target instanceof HTMLTextAreaElement
        )
          return;
        toggleLegend();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleLegend]);

  return (
    <>
      <button
        onClick={toggleLegend}
        className="w95-btn w95-font absolute top-2 right-2 z-10"
        aria-label="Toggle legend"
      >
        <span className="mr-1">&#128214;</span>
        Legend
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.15 }}
            className="absolute top-8 right-2 z-10 w-[220px] w95-raised w95-font p-0"
          >
            <div className="w95-titlebar text-[10px]">
              <span className="mr-1">&#128214;</span>
              Map Legend
              <button
                onClick={toggleLegend}
                className="w95-btn !p-0 !min-h-[14px] w-[14px] ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px]"
              >
                &#x2715;
              </button>
            </div>
            <div className="p-2">
              {/* Forces */}
              <div className="w95-groupbox mb-2">
                <span className="w95-groupbox-label">Forces</span>
                <div className="space-y-1 mt-1">
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/units/allied-infantry.svg"
                      alt="Allied"
                      style={{ width: 22, height: "auto" }}
                    />
                    <span className="text-[11px] font-bold" style={{ color: "#000080" }}>
                      Allied (USA)
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <img
                      src="/icons/units/axis-infantry.svg"
                      alt="Axis"
                      style={{ width: 22, height: "auto" }}
                    />
                    <span className="text-[11px] font-bold" style={{ color: "#cc0000" }}>
                      Axis (Germany)
                    </span>
                  </div>
                </div>
              </div>

              {/* Unit types */}
              <div className="w95-groupbox mb-2">
                <span className="w95-groupbox-label">Unit Types</span>
                <div className="space-y-1 mt-1">
                  {UNIT_TYPES_LEGEND.map(([type, label]) => (
                    <LegendIcon key={type} unitType={type} label={label} />
                  ))}
                </div>
              </div>

              {/* Echelon marks */}
              <div className="w95-groupbox mb-2">
                <span className="w95-groupbox-label">Echelon Marks</span>
                <div className="space-y-0.5 mt-1">
                  {ECHELON_LEGEND.map(([marks, label]) => (
                    <div key={marks} className="flex items-center gap-2">
                      <span className="w-[22px] text-center text-[10px] font-bold text-black">
                        {marks}
                      </span>
                      <span className="text-[11px] text-black">{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strength */}
              <div className="w95-groupbox">
                <span className="w95-groupbox-label">Combat Strength</span>
                <div className="space-y-0.5 mt-1">
                  <div className="flex items-center gap-2">
                    <div className="h-[8px] w-[20px]" style={{ background: "#008000" }} />
                    <span className="text-[11px] text-black">&gt; 70%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-[8px] w-[20px]" style={{ background: "#808000" }} />
                    <span className="text-[11px] text-black">40 - 70%</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-[8px] w-[20px]" style={{ background: "#cc0000" }} />
                    <span className="text-[11px] text-black">&lt; 40%</span>
                  </div>
                </div>
              </div>

              <div className="text-[9px] text-[#808080] text-center mt-2">
                Press L to toggle
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
