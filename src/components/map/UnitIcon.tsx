"use client";

import type { UnitType, Side, UnitStatus, Echelon } from "@/types";

const LABEL_BG: Record<Side, string> = {
  allied: "#000080",
  axis: "#800000",
};

interface UnitIconProps {
  unitType: UnitType;
  echelon?: Echelon;
  side: Side;
  name: string;
  strength: number;
  status: UnitStatus;
  scale?: number;
}

export function UnitIcon({
  unitType,
  echelon,
  side,
  name,
  strength,
  status,
  scale = 1,
}: UnitIconProps) {
  const isDestroyed = status === "destroyed" || status === "surrendered";
  const opacity = isDestroyed ? 0.4 : 1;

  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
  const iconFile = echelon
    ? `${base}/icons/units/${side}-${unitType}-${echelon}.svg`
    : `${base}/icons/units/${side}-${unitType}.svg`;

  return (
    <div
      className="flex flex-col items-center"
      style={{
        transform: `scale(${scale})`,
        opacity,
        filter: "drop-shadow(1px 1px 0 rgba(0,0,0,0.4))",
      }}
    >
      {/* Pictorial unit icon */}
      <img
        src={iconFile}
        alt={`${side} ${unitType}`}
        className="pointer-events-none"
        style={{ width: 36, height: "auto" }}
        draggable={false}
      />
      {/* Strength bar */}
      <div
        className="relative mt-0.5"
        style={{ width: 34, height: 3 }}
      >
        <div
          className="absolute inset-0"
          style={{
            backgroundColor: "#c0c0c0",
            border: "1px solid #808080",
          }}
        />
        <div
          className="absolute left-0 top-0 h-full"
          style={{
            width: `${strength}%`,
            backgroundColor:
              strength > 70
                ? "#008000"
                : strength > 40
                  ? "#808000"
                  : "#cc0000",
          }}
        />
      </div>
      {/* Unit name label */}
      {name && (
        <span
          className="mt-0.5 whitespace-nowrap text-center font-bold leading-none"
          style={{
            fontSize: "9px",
            color: "#fff",
            backgroundColor: LABEL_BG[side],
            padding: "1px 4px",
            letterSpacing: "0.02em",
            fontFamily: "Tahoma, MS Sans Serif, sans-serif",
          }}
        >
          {name}
        </span>
      )}
    </div>
  );
}
