import type { UnitType, Side } from "@/types";

const ICON_SIZE = 64;

const SIDE_COLORS: Record<Side, { border: string; fill: string }> = {
  allied: { border: "#1d4ed8", fill: "#dbeafe" },
  axis: { border: "#b91c1c", fill: "#fee2e2" },
};

function drawUnitSymbol(
  ctx: OffscreenCanvasRenderingContext2D,
  unitType: UnitType,
  side: Side
) {
  const colors = SIDE_COLORS[side];
  const size = ICON_SIZE;
  const pad = 4;
  const w = size - pad * 2;
  const h = size - pad * 2;

  // Shadow
  ctx.shadowColor = "rgba(0,0,0,0.3)";
  ctx.shadowBlur = 3;
  ctx.shadowOffsetX = 1;
  ctx.shadowOffsetY = 1;

  // Background rectangle
  ctx.fillStyle = colors.fill;
  ctx.fillRect(pad, pad, w, h);
  ctx.shadowColor = "transparent";

  // Border
  ctx.strokeStyle = colors.border;
  ctx.lineWidth = 3;
  ctx.strokeRect(pad, pad, w, h);

  // Inner symbol
  ctx.strokeStyle = colors.border;
  ctx.fillStyle = colors.border;
  ctx.lineWidth = 3;
  ctx.lineCap = "round";

  const cx = size / 2;
  const cy = size / 2;
  const inset = 8;

  switch (unitType) {
    case "infantry":
      // X cross
      ctx.beginPath();
      ctx.moveTo(pad + inset, pad + inset);
      ctx.lineTo(pad + w - inset, pad + h - inset);
      ctx.moveTo(pad + w - inset, pad + inset);
      ctx.lineTo(pad + inset, pad + h - inset);
      ctx.stroke();
      break;
    case "armor":
      // Ellipse
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2 - inset, h / 2 - inset, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "artillery":
      // Filled circle
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(w, h) / 3.5, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "airborne":
      // Vertical line + arc on top (parachute shape)
      ctx.beginPath();
      ctx.moveTo(cx, pad + inset);
      ctx.lineTo(cx, pad + h - inset);
      ctx.stroke();
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(cx, pad + inset - 2, w / 3, Math.PI, 0);
      ctx.stroke();
      break;
    case "cavalry":
    case "reconnaissance":
      // Diagonal line
      ctx.beginPath();
      ctx.moveTo(pad + inset, pad + h - inset);
      ctx.lineTo(pad + w - inset, pad + inset);
      ctx.stroke();
      break;
    case "mechanized":
      // X cross + ellipse
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pad + inset, pad + inset);
      ctx.lineTo(pad + w - inset, pad + h - inset);
      ctx.moveTo(pad + w - inset, pad + inset);
      ctx.lineTo(pad + inset, pad + h - inset);
      ctx.stroke();
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy, w / 2 - inset, h / 2 - inset, 0, 0, Math.PI * 2);
      ctx.stroke();
      break;
    case "headquarters":
      // Flag shape - vertical staff with horizontal flag line
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(pad + inset, pad + h - inset);
      ctx.lineTo(pad + inset, pad + inset);
      ctx.lineTo(pad + w - inset, pad + inset);
      ctx.stroke();
      break;
    case "engineer":
      // E letter shape
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(pad + w / 4, pad + inset);
      ctx.lineTo(pad + w / 4, pad + h - inset);
      ctx.moveTo(pad + w / 4, pad + inset);
      ctx.lineTo(pad + (3 * w) / 4, pad + inset);
      ctx.moveTo(pad + w / 4, cy);
      ctx.lineTo(pad + (3 * w) / 4, cy);
      ctx.moveTo(pad + w / 4, pad + h - inset);
      ctx.lineTo(pad + (3 * w) / 4, pad + h - inset);
      ctx.stroke();
      break;
  }
}

export function renderUnitIcon(
  unitType: UnitType,
  side: Side
): ImageData {
  const canvas = new OffscreenCanvas(ICON_SIZE, ICON_SIZE);
  const ctx = canvas.getContext("2d")!;
  ctx.clearRect(0, 0, ICON_SIZE, ICON_SIZE);
  drawUnitSymbol(ctx, unitType, side);
  return ctx.getImageData(0, 0, ICON_SIZE, ICON_SIZE);
}

export function getIconId(unitType: UnitType, side: Side): string {
  return `unit-${side}-${unitType}`;
}

export const UNIT_TYPES: UnitType[] = [
  "infantry",
  "armor",
  "artillery",
  "airborne",
  "cavalry",
  "mechanized",
  "headquarters",
  "engineer",
  "reconnaissance",
];

export const SIDES: Side[] = ["allied", "axis"];

export { ICON_SIZE };
export const SIDE_BORDER_COLORS: Record<Side, string> = {
  allied: "#1d4ed8",
  axis: "#b91c1c",
};
