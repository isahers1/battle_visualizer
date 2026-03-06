"use client";

import { useMemo } from "react";
import { useStore } from "@/stores";

interface StrengthSparklineProps {
  unitId: string;
}

export function StrengthSparkline({ unitId }: StrengthSparklineProps) {
  const timeline = useStore((s) => s.timeline);
  const currentStep = useStore((s) => s.currentStep);

  const { strengths, points, crisisIndex, crisisDrop, currentStrength } =
    useMemo(() => {
      const vals = timeline.map((stage) => {
        const unitState = stage.unitStates[unitId];
        return unitState ? unitState.strength : 100;
      });

      const width = 200;
      const height = 40;
      const padX = 2;
      const padY = 4;
      const plotW = width - padX * 2;
      const plotH = height - padY * 2;

      const pts = vals.map((v, i) => {
        const x = padX + (vals.length > 1 ? (i / (vals.length - 1)) * plotW : plotW / 2);
        const y = padY + plotH - (v / 100) * plotH;
        return { x, y };
      });

      // Find crisis point: greatest single-stage drop
      let maxDrop = 0;
      let crisisIdx = -1;
      for (let i = 1; i < vals.length; i++) {
        const drop = vals[i - 1] - vals[i];
        if (drop > maxDrop) {
          maxDrop = drop;
          crisisIdx = i;
        }
      }

      return {
        strengths: vals,
        points: pts,
        crisisIndex: crisisIdx,
        crisisDrop: maxDrop,
        currentStrength: vals[currentStep] ?? 100,
      };
    }, [timeline, unitId, currentStep]);

  if (timeline.length === 0 || points.length === 0) return null;

  const width = 200;
  const height = 40;
  const padX = 2;
  const plotW = width - padX * 2;

  const lineColor =
    currentStrength > 70
      ? "#008000"
      : currentStrength > 40
        ? "#808000"
        : "#cc0000";

  const polylineStr = points.map((p) => `${p.x},${p.y}`).join(" ");

  const currentX =
    padX +
    (timeline.length > 1
      ? (currentStep / (timeline.length - 1)) * plotW
      : plotW / 2);

  return (
    <div className="w95-sunken p-0.5" style={{ width: 208 }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        style={{ display: "block" }}
      >
        {/* Polyline chart */}
        <polyline
          points={polylineStr}
          fill="none"
          stroke={lineColor}
          strokeWidth={1.5}
          strokeLinejoin="round"
        />

        {/* Current stage vertical dashed line */}
        <line
          x1={currentX}
          y1={2}
          x2={currentX}
          y2={38}
          stroke="#000000"
          strokeWidth={1}
          strokeDasharray="2,2"
          opacity={0.5}
        />

        {/* Crisis point dot */}
        {crisisIndex > 0 && crisisDrop > 0 && (
          <g>
            <circle
              cx={points[crisisIndex].x}
              cy={points[crisisIndex].y}
              r={3}
              fill="#cc0000"
              stroke="#ffffff"
              strokeWidth={0.5}
            />
            <title>
              Crisis: -{crisisDrop}% at stage {crisisIndex}
            </title>
          </g>
        )}

        {/* Axis labels */}
        <text
          x={padX}
          y={height - 1}
          fontSize={7}
          fill="#808080"
          textAnchor="start"
        >
          0
        </text>
        <text
          x={width - padX}
          y={height - 1}
          fontSize={7}
          fill="#808080"
          textAnchor="end"
        >
          {timeline.length - 1}
        </text>
      </svg>
    </div>
  );
}
