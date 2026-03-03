"use client";

import { useState } from "react";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

export function BattleHeader() {
  const metadata = useStore((s) => s.metadata);
  const snapshot = useCurrentSnapshot();
  const [open, setOpen] = useState(false);

  if (!metadata) return null;

  const currentDate = snapshot
    ? new Date(snapshot.dateTime).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "";

  const overview = metadata.overview;

  return (
    <>
      <div className="absolute top-2 left-1/2 z-10 -translate-x-1/2">
        <button
          onClick={() => setOpen(true)}
          className="w95-raised w95-font cursor-pointer block"
          style={{ padding: 0 }}
        >
          <div className="w95-titlebar gap-2">
            <span className="text-[10px]">&#9776;</span>
            <span>{metadata.name}.exe</span>
            <span className="ml-auto flex gap-0.5">
              <span className="w95-btn !p-0 !min-h-[14px] w-[14px] flex items-center justify-center text-[9px] leading-none !border-[1px]">_</span>
              <span className="w95-btn !p-0 !min-h-[14px] w-[14px] flex items-center justify-center text-[9px] leading-none !border-[1px]">&#x25A1;</span>
            </span>
          </div>
          <div className="px-3 py-2 text-center">
            <div className="font-bold text-[12px] text-black tracking-tight">
              {metadata.name}
            </div>
            {currentDate && (
              <div className="text-[10px] text-[#404040] mt-0.5">
                {currentDate}
              </div>
            )}
            <div className="text-[9px] text-[#808080] mt-1">
              Click for battle overview
            </div>
          </div>
        </button>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false} className="w95-raised w95-font !rounded-none !p-0 !border-0 max-w-2xl">
          <div className="w95-titlebar">
            <span className="text-[10px] mr-2">&#128214;</span>
            <span>{metadata.name} — Battle Overview</span>
            <button
              onClick={() => setOpen(false)}
              className="w95-btn !p-0 !min-h-[14px] w-[14px] ml-auto flex items-center justify-center text-[9px] leading-none !border-[1px]"
            >
              &#x2715;
            </button>
          </div>

          <DialogHeader className="sr-only">
            <DialogTitle>{metadata.name} Overview</DialogTitle>
            <DialogDescription>Full battle overview and historical context</DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[70vh]">
            <div className="p-3 space-y-2">
              {/* Overview / Strategic Context */}
              {overview?.context && (
                <div className="w95-groupbox">
                  <span className="w95-groupbox-label">Strategic Context</span>
                  <p className="text-[11px] text-black leading-relaxed mt-1">
                    {overview.context}
                  </p>
                </div>
              )}

              {/* German Plan */}
              {overview?.germanPlan && (
                <div className="w95-groupbox">
                  <span className="w95-groupbox-label">Operation Wacht am Rhein</span>
                  <p className="text-[11px] text-black leading-relaxed mt-1">
                    {overview.germanPlan}
                  </p>
                </div>
              )}

              {/* Key Phases */}
              {overview?.keyPhases && overview.keyPhases.length > 0 && (
                <div className="w95-groupbox">
                  <span className="w95-groupbox-label">Key Phases</span>
                  <div className="space-y-2 mt-1">
                    {overview.keyPhases.map((phase, i) => (
                      <div key={i}>
                        <div className="text-[11px] font-bold text-[#000080] mb-0.5">
                          {phase.heading}
                        </div>
                        <p className="text-[11px] text-black leading-relaxed">
                          {phase.body}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Belligerents */}
              <div className="w95-groupbox">
                <span className="w95-groupbox-label">Belligerents</span>
                <div className="flex gap-4 mt-1">
                  {metadata.belligerents.map((b) => (
                    <div key={b.name} className="flex items-center gap-1.5">
                      <div
                        className="w-[10px] h-[10px] border border-[#808080]"
                        style={{ background: b.color }}
                      />
                      <span className="text-[11px] text-black">
                        {b.name} ({b.side === "allied" ? "Allied" : "Axis"})
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Casualties */}
              {overview?.casualties && (
                <div className="w95-groupbox">
                  <span className="w95-groupbox-label">Casualties</span>
                  <div className="space-y-1 mt-1">
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-[#000080] w-[50px] flex-shrink-0">Allied:</span>
                      <span className="text-[11px] text-black">{overview.casualties.allied}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-[11px] font-bold text-[#cc0000] w-[50px] flex-shrink-0">Axis:</span>
                      <span className="text-[11px] text-black">{overview.casualties.axis}</span>
                    </div>
                    {overview.casualties.note && (
                      <div className="w95-sunken p-1.5 mt-1">
                        <p className="text-[10px] text-[#404040] leading-relaxed">
                          {overview.casualties.note}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Outcome */}
              {overview?.outcome && (
                <div className="w95-groupbox">
                  <span className="w95-groupbox-label">Outcome</span>
                  <p className="text-[11px] text-black leading-relaxed mt-1">
                    {overview.outcome}
                  </p>
                </div>
              )}

              {/* Legacy */}
              {overview?.legacy && (
                <div className="w95-groupbox">
                  <span className="w95-groupbox-label">Historical Legacy</span>
                  <p className="text-[11px] text-black leading-relaxed mt-1">
                    {overview.legacy}
                  </p>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Statusbar */}
          <div className="w95-statusbar">
            <div className="w95-statusbar-cell flex-1">
              {metadata.startDate} — {metadata.endDate}
            </div>
            <div className="w95-statusbar-cell">
              <button onClick={() => setOpen(false)} className="w95-btn px-3 !min-h-[16px] text-[10px]">
                OK
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
