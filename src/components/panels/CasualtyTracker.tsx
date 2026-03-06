"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { useStore } from "@/stores";
import { useCurrentSnapshot } from "@/hooks/useCurrentSnapshot";

interface SideCasualties {
  killed: number;
  wounded: number;
  captured: number;
  missing: number;
}

const CATEGORIES: { key: keyof SideCasualties; abbr: string; color: string }[] = [
  { key: "killed", abbr: "KIA", color: "#cc0000" },
  { key: "wounded", abbr: "WIA", color: "#cc6600" },
  { key: "captured", abbr: "POW", color: "#555555" },
  { key: "missing", abbr: "MIA", color: "#808080" },
];

function AnimatedNumber({ value, duration = 800 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = useRef(value);
  const rafRef = useRef(0);

  useEffect(() => {
    const from = prevRef.current;
    const to = value;
    prevRef.current = value;

    if (from === to) {
      setDisplay(to);
      return;
    }

    const start = performance.now();
    function animate(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      setDisplay(Math.round(from + (to - from) * eased));
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate);
      }
    }
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);

  return <>{display.toLocaleString()}</>;
}

function DeltaBadge({ delta }: { delta: number }) {
  const [visible, setVisible] = useState(false);
  const [currentDelta, setCurrentDelta] = useState(0);

  useEffect(() => {
    if (delta > 0) {
      setCurrentDelta(delta);
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [delta]);

  if (!visible || currentDelta <= 0) return null;

  return (
    <span
      className="text-[8px] font-bold font-mono animate-pulse"
      style={{ color: "#cc0000" }}
    >
      +{currentDelta.toLocaleString()}
    </span>
  );
}

function StackedBar({ side }: { side: SideCasualties }) {
  const total = side.killed + side.wounded + side.captured + side.missing;
  if (total === 0) return <div className="h-[4px] w-full bg-[#d4d0c8]" style={{ border: "1px solid #a0a0a0" }} />;

  return (
    <div className="h-[4px] w-full flex overflow-hidden" style={{ border: "1px solid #a0a0a0" }}>
      {CATEGORIES.map((cat) => {
        const pct = (side[cat.key] / total) * 100;
        if (pct === 0) return null;
        return (
          <div
            key={cat.key}
            className="h-full transition-all duration-700"
            style={{ width: `${pct}%`, background: cat.color }}
          />
        );
      })}
    </div>
  );
}

function SidePanel({
  label,
  side,
  sideColor,
  prevSide,
}: {
  label: string;
  side: SideCasualties;
  sideColor: string;
  prevSide: SideCasualties | null;
}) {
  const total = side.killed + side.wounded + side.captured + side.missing;

  return (
    <div>
      {/* Side header with total */}
      <div className="flex items-center gap-1.5 mb-1">
        <div
          className="h-[10px] w-[10px] flex-shrink-0"
          style={{
            background: sideColor,
            border: "1px solid rgba(0,0,0,0.3)",
          }}
        />
        <span className="text-[11px] font-bold text-black">{label}</span>
        <span className="text-[13px] font-bold font-mono text-black ml-auto tabular-nums">
          <AnimatedNumber value={total} />
        </span>
      </div>

      {/* Stacked proportional bar */}
      <StackedBar side={side} />

      {/* Compact category breakdown */}
      <div className="flex flex-wrap gap-x-2 gap-y-0.5 mt-1">
        {CATEGORIES.map((cat) => {
          const val = side[cat.key];
          const prevVal = prevSide ? prevSide[cat.key] : val;
          const delta = val - prevVal;

          if (val === 0 && delta === 0) return null;

          return (
            <span key={cat.key} className="inline-flex items-baseline gap-0.5">
              <span className="text-[9px] font-bold" style={{ color: cat.color }}>
                {cat.abbr}
              </span>
              <span className="text-[9px] font-mono tabular-nums" style={{ color: cat.color }}>
                <AnimatedNumber value={val} />
              </span>
              <DeltaBadge delta={delta} />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export function CasualtyTracker() {
  const units = useStore((s) => s.units);
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);
  const snapshot = useCurrentSnapshot();

  const totals = useMemo(() => {
    if (!snapshot) return null;

    const allied: SideCasualties = { killed: 0, wounded: 0, captured: 0, missing: 0 };
    const axis: SideCasualties = { killed: 0, wounded: 0, captured: 0, missing: 0 };

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

  const prevTotals = useMemo(() => {
    if (currentStep <= 0 || !timeline[currentStep - 1]) return null;
    const prevSnapshot = timeline[currentStep - 1];

    const allied: SideCasualties = { killed: 0, wounded: 0, captured: 0, missing: 0 };
    const axis: SideCasualties = { killed: 0, wounded: 0, captured: 0, missing: 0 };

    for (const [unitId, state] of Object.entries(prevSnapshot.unitStates)) {
      const unit = units[unitId];
      if (!unit) continue;
      const target = unit.side === "allied" ? allied : axis;
      target.killed += state.casualties.killed;
      target.wounded += state.casualties.wounded;
      target.captured += state.casualties.captured;
      target.missing += state.casualties.missing;
    }

    return { allied, axis };
  }, [units, timeline, currentStep]);

  if (!totals) return null;

  return (
    <div className="w95-raised w95-font p-0 w-[170px] max-h-[calc(100vh-120px)] flex flex-col">
      <div className="w95-titlebar text-[10px] flex-shrink-0">
        <span className="mr-1">&#9760;</span>
        Casualties
      </div>
      <div className="p-2 space-y-3 overflow-y-auto">
        <SidePanel
          label="Allied"
          side={totals.allied}
          sideColor="#000080"
          prevSide={prevTotals?.allied ?? null}
        />
        <div className="border-t border-[#a0a0a0]" />
        <SidePanel
          label="Axis"
          side={totals.axis}
          sideColor="#cc0000"
          prevSide={prevTotals?.axis ?? null}
        />
      </div>
    </div>
  );
}
