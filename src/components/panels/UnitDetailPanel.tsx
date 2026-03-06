"use client";

import { useState, useMemo } from "react";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UnitIcon } from "@/components/map/UnitIcon";
import { StrengthSparkline } from "@/components/panels/StrengthSparkline";
import { EquipmentEncyclopedia } from "@/components/panels/EquipmentEncyclopedia";
import type { UnitStatus, Equipment } from "@/types";

const STATUS_LABELS: Record<UnitStatus, { label: string; color: string }> = {
  reserve: { label: "In Reserve", color: "#808080" },
  moving: { label: "Moving", color: "#000080" },
  engaged: { label: "Engaged", color: "#cc6600" },
  defending: { label: "Defending", color: "#006699" },
  retreating: { label: "Retreating", color: "#996600" },
  destroyed: { label: "Destroyed", color: "#cc0000" },
  surrendered: { label: "Surrendered", color: "#808080" },
};

function formatEchelon(echelon: string) {
  return echelon
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

type TabId = "overview" | "equipment" | "casualties" | "history";

const TABS: { id: TabId; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "equipment", label: "Equipment" },
  { id: "casualties", label: "Casualties" },
  { id: "history", label: "History" },
];

function groupEquipment(equipment: Equipment[]): Record<string, Equipment[]> {
  const groups: Record<string, Equipment[]> = {};
  for (const eq of equipment) {
    const cat = eq.category;
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(eq);
  }
  return groups;
}

export function UnitDetailPanel() {
  const isOpen = useStore((s) => s.isDetailPanelOpen);
  const selectedUnitId = useStore((s) => s.selectedUnitId);
  const units = useStore((s) => s.units);
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);
  const closeDetailPanel = useStore((s) => s.closeDetailPanel);
  const openDetailPanel = useStore((s) => s.openDetailPanel);
  const snapshot = useCurrentSnapshot();

  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [encyclopediaOpen, setEncyclopediaOpen] = useState(false);
  const [encyclopediaItem, setEncyclopediaItem] = useState<string | undefined>(
    undefined
  );

  const unit = selectedUnitId ? units[selectedUnitId] : null;
  const unitState =
    selectedUnitId && snapshot
      ? snapshot.unitStates[selectedUnitId]
      : null;

  const parentUnit = unit?.parentId ? units[unit.parentId] : null;
  const childUnits =
    unit?.childIds?.map((id) => units[id]).filter(Boolean) ?? [];

  const statusInfo = unitState
    ? STATUS_LABELS[unitState.status] ?? {
        label: unitState.status,
        color: "#808080",
      }
    : null;

  const totalCasualties = unitState
    ? unitState.casualties.killed +
      unitState.casualties.wounded +
      unitState.casualties.captured +
      unitState.casualties.missing
    : 0;

  const strengthColor =
    unitState && unitState.strength > 70
      ? "#008000"
      : unitState && unitState.strength > 40
        ? "#808000"
        : "#cc0000";

  // Cumulative casualties over time for bar chart
  const casualtyTimeline = useMemo(() => {
    if (!selectedUnitId || timeline.length === 0) return [];
    return timeline.map((stage) => {
      const us = stage.unitStates[selectedUnitId];
      if (!us) return 0;
      return (
        us.casualties.killed +
        us.casualties.wounded +
        us.casualties.captured +
        us.casualties.missing
      );
    });
  }, [selectedUnitId, timeline]);

  const openEncyclopedia = (itemName: string) => {
    setEncyclopediaItem(itemName);
    setEncyclopediaOpen(true);
  };

  return (
    <>
      <Sheet
        open={isOpen}
        onOpenChange={(open) => !open && closeDetailPanel()}
      >
        <SheetContent
          side="right"
          showCloseButton={false}
          className="w-[380px] sm:w-[420px] !p-0 !rounded-none !border-0 w95-font bg-[#c0c0c0]"
        >
          {unit && unitState ? (
            <div className="h-full flex flex-col">
              {/* Win95 window frame */}
              <div
                className="w95-titlebar px-1 py-[3px] flex-shrink-0"
                style={{
                  background:
                    unit.side === "allied"
                      ? "linear-gradient(90deg, #000080, #1084d0)"
                      : "linear-gradient(90deg, #800000, #cc4444)",
                }}
              >
                <span className="text-[10px] mr-1">&#128196;</span>
                <span className="text-[11px] truncate">{unit.name}</span>
                <button
                  onClick={closeDetailPanel}
                  className="w95-btn !p-0 !min-h-[14px] w-[14px] ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px] flex-shrink-0"
                >
                  &#x2715;
                </button>
              </div>

              {/* Win95-style tabs */}
              <div className="bg-[#c0c0c0] px-1 pt-1 flex-shrink-0">
                <div className="flex" style={{ marginBottom: "-1px" }}>
                  {TABS.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className="text-[11px] px-2.5 py-1 relative"
                        style={{
                          background: isActive ? "#c0c0c0" : "#b0b0b0",
                          border: "1px solid",
                          borderColor: isActive
                            ? "#ffffff #404040 #c0c0c0 #ffffff"
                            : "#ffffff #404040 #404040 #ffffff",
                          borderBottom: isActive
                            ? "1px solid #c0c0c0"
                            : "1px solid #404040",
                          marginTop: isActive ? "0px" : "2px",
                          zIndex: isActive ? 2 : 1,
                          fontWeight: isActive ? "bold" : "normal",
                          color: "#000000",
                        }}
                      >
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Tab content border */}
              <div
                className="flex-1 flex flex-col mx-1 mb-1 overflow-hidden"
                style={{
                  border: "1px solid",
                  borderColor: "#ffffff #404040 #404040 #ffffff",
                  background: "#c0c0c0",
                }}
              >
                <ScrollArea className="flex-1 bg-[#c0c0c0]">
                  {/* Header area - always visible */}
                  <div className="p-3 pb-2">
                    <SheetHeader className="space-y-0">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 mt-0.5">
                          <UnitIcon
                            unitType={unit.unitType}
                            echelon={unit.echelon}
                            side={unit.side}
                            name=""
                            strength={unitState.strength}
                            status={unitState.status}
                            scale={1.2}
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <SheetTitle className="text-[13px] font-bold text-black leading-tight w95-font">
                            {unit.name}
                          </SheetTitle>
                          <SheetDescription className="text-[11px] text-[#404040] mt-0.5 w95-font">
                            {unit.commander}
                          </SheetDescription>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        <span className="w95-sunken px-2 py-0.5 text-[10px] text-black capitalize">
                          {unit.unitType}
                        </span>
                        <span className="w95-sunken px-2 py-0.5 text-[10px] text-black">
                          {formatEchelon(unit.echelon)}
                        </span>
                        {statusInfo && (
                          <span
                            className="px-2 py-0.5 text-[10px] font-bold text-white"
                            style={{ background: statusInfo.color }}
                          >
                            {statusInfo.label}
                          </span>
                        )}
                      </div>
                    </SheetHeader>
                  </div>

                  <div className="px-3 pb-3 space-y-3">
                    {/* ========== OVERVIEW TAB ========== */}
                    {activeTab === "overview" && (
                      <>
                        {/* Strength */}
                        <div className="w95-groupbox">
                          <span className="w95-groupbox-label">
                            Combat Strength
                          </span>
                          <div className="flex items-center gap-2 mt-1">
                            <div className="w95-progress flex-1">
                              <div
                                className="h-full"
                                style={{
                                  width: `${unitState.strength}%`,
                                  background: `repeating-linear-gradient(90deg, ${strengthColor} 0px, ${strengthColor} 8px, transparent 8px, transparent 10px)`,
                                }}
                              />
                            </div>
                            <span className="text-[11px] font-bold text-black w-[32px] text-right">
                              {unitState.strength}%
                            </span>
                          </div>
                          {selectedUnitId && (
                            <div className="mt-1.5">
                              <StrengthSparkline unitId={selectedUnitId} />
                            </div>
                          )}
                        </div>

                        {/* Personnel */}
                        {unit.personnel && (
                          <div className="w95-groupbox">
                            <span className="w95-groupbox-label">
                              Personnel
                            </span>
                            <div className="grid grid-cols-3 gap-1.5 mt-1">
                              <div className="w95-sunken p-1.5 text-center">
                                <div className="text-[9px] text-[#808080] uppercase">
                                  Officers
                                </div>
                                <div className="text-[13px] font-bold text-[#000080]">
                                  {unit.personnel.officers.toLocaleString()}
                                </div>
                              </div>
                              <div className="w95-sunken p-1.5 text-center">
                                <div className="text-[9px] text-[#808080] uppercase">
                                  NCOs
                                </div>
                                <div className="text-[13px] font-bold text-[#806600]">
                                  {unit.personnel.ncos.toLocaleString()}
                                </div>
                              </div>
                              <div className="w95-sunken p-1.5 text-center">
                                <div className="text-[9px] text-[#808080] uppercase">
                                  Enlisted
                                </div>
                                <div className="text-[13px] font-bold text-black">
                                  {unit.personnel.enlisted.toLocaleString()}
                                </div>
                              </div>
                            </div>
                            <div className="text-[10px] text-[#808080] text-right mt-1">
                              Total:{" "}
                              {(
                                unit.personnel.officers +
                                unit.personnel.ncos +
                                unit.personnel.enlisted
                              ).toLocaleString()}{" "}
                              men
                            </div>
                          </div>
                        )}
                      </>
                    )}

                    {/* ========== EQUIPMENT TAB ========== */}
                    {activeTab === "equipment" && (
                      <>
                        {unit.equipment.length > 0 ? (
                          Object.entries(groupEquipment(unit.equipment)).map(
                            ([category, eqList]) => (
                              <div key={category} className="w95-groupbox">
                                <span className="w95-groupbox-label">
                                  {category}
                                </span>
                                <div className="mt-1 space-y-0.5">
                                  {eqList.map((eq, i) => (
                                    <button
                                      key={i}
                                      onClick={() =>
                                        openEncyclopedia(eq.name)
                                      }
                                      className="w95-btn w-full text-left !justify-start gap-2 !text-[11px]"
                                    >
                                      <span className="font-bold flex-1">
                                        {eq.name}
                                      </span>
                                      <span className="text-[#808080] font-mono">
                                        x{eq.quantity.toLocaleString()}
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )
                          )
                        ) : (
                          <div className="text-[11px] text-[#808080] italic px-1">
                            No equipment data available for this unit.
                          </div>
                        )}
                      </>
                    )}

                    {/* ========== CASUALTIES TAB ========== */}
                    {activeTab === "casualties" && (
                      <>
                        {totalCasualties > 0 ? (
                          <>
                            <div className="w95-groupbox">
                              <span className="w95-groupbox-label">
                                Current Casualties
                              </span>
                              <div className="grid grid-cols-2 gap-1.5 mt-1">
                                {unitState.casualties.killed > 0 && (
                                  <div className="w95-sunken p-1.5">
                                    <div className="text-[9px] text-[#808080] uppercase">
                                      Killed
                                    </div>
                                    <div className="text-[13px] font-bold text-[#cc0000]">
                                      {unitState.casualties.killed.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                {unitState.casualties.wounded > 0 && (
                                  <div className="w95-sunken p-1.5">
                                    <div className="text-[9px] text-[#808080] uppercase">
                                      Wounded
                                    </div>
                                    <div className="text-[13px] font-bold text-[#cc6600]">
                                      {unitState.casualties.wounded.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                {unitState.casualties.captured > 0 && (
                                  <div className="w95-sunken p-1.5">
                                    <div className="text-[9px] text-[#808080] uppercase">
                                      Captured
                                    </div>
                                    <div className="text-[13px] font-bold text-[#404040]">
                                      {unitState.casualties.captured.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                                {unitState.casualties.missing > 0 && (
                                  <div className="w95-sunken p-1.5">
                                    <div className="text-[9px] text-[#808080] uppercase">
                                      Missing
                                    </div>
                                    <div className="text-[13px] font-bold text-[#808080]">
                                      {unitState.casualties.missing.toLocaleString()}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cumulative casualties bar chart */}
                            {casualtyTimeline.length > 0 && (
                              <div className="w95-groupbox">
                                <span className="w95-groupbox-label">
                                  Casualties Over Time
                                </span>
                                <CasualtyBarChart
                                  data={casualtyTimeline}
                                  currentStep={currentStep}
                                />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="text-[11px] text-[#808080] italic px-1">
                            No casualties reported at this point in the
                            battle.
                          </div>
                        )}
                      </>
                    )}

                    {/* ========== HISTORY TAB ========== */}
                    {activeTab === "history" && (
                      <>
                        <div className="w95-groupbox">
                          <span className="w95-groupbox-label">
                            Historical Context
                          </span>
                          <div className="w95-sunken p-2 mt-1">
                            <p className="text-[11px] leading-relaxed text-black">
                              {unit.history}
                            </p>
                          </div>
                        </div>

                        {/* Chain of Command */}
                        {(parentUnit || childUnits.length > 0) && (
                          <div className="w95-groupbox">
                            <span className="w95-groupbox-label">
                              Chain of Command
                            </span>
                            <div className="mt-1">
                              {parentUnit && (
                                <div className="mb-1.5">
                                  <div className="text-[9px] text-[#808080] uppercase mb-0.5">
                                    Reports to
                                  </div>
                                  <button
                                    onClick={() =>
                                      openDetailPanel(parentUnit.id)
                                    }
                                    className="w95-btn w-full text-left !justify-start gap-1.5"
                                  >
                                    <span
                                      className="h-[8px] w-[8px] inline-block flex-shrink-0"
                                      style={{
                                        background:
                                          parentUnit.side === "allied"
                                            ? "#000080"
                                            : "#cc0000",
                                      }}
                                    />
                                    <span className="text-[11px]">
                                      {parentUnit.name}
                                    </span>
                                  </button>
                                </div>
                              )}
                              {childUnits.length > 0 && (
                                <div>
                                  <div className="text-[9px] text-[#808080] uppercase mb-0.5">
                                    Subordinate units
                                  </div>
                                  <div className="w95-sunken p-1 max-h-[120px] overflow-y-auto">
                                    {childUnits.map((child) => (
                                      <button
                                        key={child.id}
                                        onClick={() =>
                                          openDetailPanel(child.id)
                                        }
                                        className="flex items-center gap-1.5 w-full text-left px-1 py-0.5 hover:bg-[#000080] hover:text-white text-[11px] text-black"
                                      >
                                        <span
                                          className="h-[6px] w-[6px] inline-block flex-shrink-0"
                                          style={{
                                            background:
                                              child.side === "allied"
                                                ? "#000080"
                                                : "#cc0000",
                                          }}
                                        />
                                        {child.name}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </ScrollArea>
              </div>

              {/* Status bar */}
              <div className="w95-statusbar flex-shrink-0">
                <div className="w95-statusbar-cell flex-1">
                  {unit.shortName} — {formatEchelon(unit.echelon)}
                </div>
                <div className="w95-statusbar-cell">
                  {unitState.strength}% strength
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-[#808080] bg-[#c0c0c0] w95-font text-[11px]">
              Select a unit to view details
            </div>
          )}
        </SheetContent>
      </Sheet>

      <EquipmentEncyclopedia
        isOpen={encyclopediaOpen}
        onClose={() => setEncyclopediaOpen(false)}
        initialItem={encyclopediaItem}
      />
    </>
  );
}

/* Mini bar chart for cumulative casualties over time */
function CasualtyBarChart({
  data,
  currentStep,
}: {
  data: number[];
  currentStep: number;
}) {
  const maxVal = Math.max(...data, 1);
  const width = 200;
  const height = 60;
  const padX = 2;
  const padY = 10;
  const plotW = width - padX * 2;
  const plotH = height - padY * 2;
  const barW = data.length > 0 ? plotW / data.length - 1 : 0;

  return (
    <div className="w95-sunken p-0.5 mt-1" style={{ width: 208 }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {data.map((val, i) => {
          const barH = maxVal > 0 ? (val / maxVal) * plotH : 0;
          const x = padX + i * (plotW / data.length);
          const y = padY + plotH - barH;
          const isCurrent = i === currentStep;
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={Math.max(barW, 1)}
              height={barH}
              fill={isCurrent ? "#cc0000" : "#996600"}
              opacity={isCurrent ? 1 : 0.6}
            />
          );
        })}
        {/* Axis labels */}
        <text x={padX} y={height - 1} fontSize={7} fill="#808080" textAnchor="start">
          0
        </text>
        <text
          x={width - padX}
          y={height - 1}
          fontSize={7}
          fill="#808080"
          textAnchor="end"
        >
          {data.length - 1}
        </text>
        <text x={width - padX} y={padY - 2} fontSize={7} fill="#808080" textAnchor="end">
          {maxVal.toLocaleString()}
        </text>
      </svg>
    </div>
  );
}
