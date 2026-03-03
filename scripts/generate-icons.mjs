import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const outDir = join(import.meta.dirname, "..", "public", "icons", "units");
mkdirSync(outDir, { recursive: true });

// ──── Colors ────
const COLORS = {
  allied: { fill: "#93c5fd", stroke: "#1e3a8a" },
  axis:   { fill: "#fca5a5", stroke: "#7f1d1d" },
};
const IC = "#1e293b"; // icon silhouette color (dark slate)

// ──── Echelon definitions ────
const ECHELONS = {
  battalion:  { bars: 2, xMarks: 0 },
  regiment:   { bars: 3, xMarks: 0 },
  brigade:    { bars: 0, xMarks: 1 },
  division:   { bars: 0, xMarks: 2 },
  corps:      { bars: 0, xMarks: 3 },
  army:       { bars: 0, xMarks: 4 },
  army_group: { bars: 0, xMarks: 5 },
};

// ──── Pictorial Icon Functions ────
// Each draws a recognizable silhouette centered at (cx, cy), fitting within ~60x50

function infantryIcon(cx, cy) {
  // Soldier figure with rifle
  return [
    `<circle cx="${cx}" cy="${cy - 15}" r="7" fill="${IC}"/>`,
    `<path d="M${cx - 9},${cy - 6} L${cx + 9},${cy - 6} L${cx + 8},${cy + 14} L${cx - 8},${cy + 14} Z" fill="${IC}"/>`,
    `<line x1="${cx - 4}" y1="${cy + 14}" x2="${cx - 7}" y2="${cy + 26}" stroke="${IC}" stroke-width="4.5" stroke-linecap="round"/>`,
    `<line x1="${cx + 4}" y1="${cy + 14}" x2="${cx + 7}" y2="${cy + 26}" stroke="${IC}" stroke-width="4.5" stroke-linecap="round"/>`,
    `<line x1="${cx + 9}" y1="${cy - 4}" x2="${cx + 24}" y2="${cy - 18}" stroke="${IC}" stroke-width="3.5" stroke-linecap="round"/>`,
  ].join("");
}

function armorIcon(cx, cy) {
  // Tank side profile
  return [
    `<rect x="${cx - 28}" y="${cy}" width="56" height="18" rx="3" fill="${IC}"/>`,
    `<rect x="${cx - 14}" y="${cy - 14}" width="28" height="16" rx="3" fill="${IC}"/>`,
    `<line x1="${cx + 14}" y1="${cy - 7}" x2="${cx + 33}" y2="${cy - 10}" stroke="${IC}" stroke-width="5" stroke-linecap="round"/>`,
    `<rect x="${cx - 30}" y="${cy + 16}" width="60" height="8" rx="4" fill="${IC}" opacity="0.6"/>`,
  ].join("");
}

function artilleryIcon(cx, cy) {
  // Cannon / howitzer
  return [
    `<line x1="${cx - 5}" y1="${cy + 5}" x2="${cx + 25}" y2="${cy - 22}" stroke="${IC}" stroke-width="7" stroke-linecap="round"/>`,
    `<circle cx="${cx - 2}" cy="${cy + 15}" r="10" fill="none" stroke="${IC}" stroke-width="4"/>`,
    `<circle cx="${cx - 2}" cy="${cy + 15}" r="3" fill="${IC}"/>`,
    `<line x1="${cx - 12}" y1="${cy + 6}" x2="${cx - 28}" y2="${cy + 18}" stroke="${IC}" stroke-width="4" stroke-linecap="round"/>`,
  ].join("");
}

function airborneIcon(cx, cy) {
  // Parachute with figure
  return [
    `<path d="M${cx - 24},${cy} Q${cx},${cy - 32} ${cx + 24},${cy}" fill="${IC}" opacity="0.8"/>`,
    `<line x1="${cx - 22}" y1="${cy}" x2="${cx}" y2="${cy + 18}" stroke="${IC}" stroke-width="2"/>`,
    `<line x1="${cx}" y1="${cy - 4}" x2="${cx}" y2="${cy + 18}" stroke="${IC}" stroke-width="2"/>`,
    `<line x1="${cx + 22}" y1="${cy}" x2="${cx}" y2="${cy + 18}" stroke="${IC}" stroke-width="2"/>`,
    `<circle cx="${cx}" cy="${cy + 23}" r="5" fill="${IC}"/>`,
  ].join("");
}

function cavalryIcon(cx, cy) {
  // Horseshoe
  return `<path d="M${cx - 15},${cy + 20} C${cx - 22},${cy} ${cx - 18},${cy - 24} ${cx},${cy - 24} C${cx + 18},${cy - 24} ${cx + 22},${cy} ${cx + 15},${cy + 20}" fill="none" stroke="${IC}" stroke-width="8" stroke-linecap="round"/>`;
}

function reconnaissanceIcon(cx, cy) {
  // Binoculars
  return [
    `<circle cx="${cx - 12}" cy="${cy}" r="13" fill="none" stroke="${IC}" stroke-width="5"/>`,
    `<circle cx="${cx + 12}" cy="${cy}" r="13" fill="none" stroke="${IC}" stroke-width="5"/>`,
    `<rect x="${cx - 5}" y="${cy - 4}" width="10" height="8" rx="2" fill="${IC}"/>`,
  ].join("");
}

function mechanizedIcon(cx, cy) {
  // APC / half-track
  return [
    `<path d="M${cx - 28},${cy - 6} L${cx - 18},${cy - 18} L${cx + 28},${cy - 18} L${cx + 28},${cy + 8} L${cx - 28},${cy + 8} Z" fill="${IC}"/>`,
    `<circle cx="${cx - 16}" cy="${cy + 14}" r="7" fill="${IC}"/>`,
    `<circle cx="${cx + 2}" cy="${cy + 14}" r="7" fill="${IC}"/>`,
    `<circle cx="${cx + 20}" cy="${cy + 14}" r="7" fill="${IC}"/>`,
  ].join("");
}

function headquartersIcon(cx, cy) {
  // Building with flag
  return [
    `<rect x="${cx - 18}" y="${cy - 5}" width="36" height="28" fill="${IC}"/>`,
    `<path d="M${cx - 22},${cy - 5} L${cx},${cy - 22} L${cx + 22},${cy - 5} Z" fill="${IC}"/>`,
    `<rect x="${cx - 5}" y="${cy + 8}" width="10" height="15" rx="2" fill="white" opacity="0.4"/>`,
    `<line x1="${cx}" y1="${cy - 22}" x2="${cx}" y2="${cy - 38}" stroke="${IC}" stroke-width="2.5"/>`,
    `<path d="M${cx},${cy - 38} L${cx + 12},${cy - 33} L${cx},${cy - 28}" fill="${IC}"/>`,
  ].join("");
}

function engineerIcon(cx, cy) {
  // Castle turret / fortification
  return [
    `<rect x="${cx - 22}" y="${cy - 5}" width="44" height="28" fill="${IC}"/>`,
    `<rect x="${cx - 22}" y="${cy - 18}" width="12" height="15" fill="${IC}"/>`,
    `<rect x="${cx - 6}" y="${cy - 18}" width="12" height="15" fill="${IC}"/>`,
    `<rect x="${cx + 10}" y="${cy - 18}" width="12" height="15" fill="${IC}"/>`,
    `<rect x="${cx - 5}" y="${cy + 8}" width="10" height="15" rx="5" fill="white" opacity="0.4"/>`,
  ].join("");
}

const UNIT_ICONS = {
  infantry: infantryIcon,
  armor: armorIcon,
  artillery: artilleryIcon,
  airborne: airborneIcon,
  cavalry: cavalryIcon,
  reconnaissance: reconnaissanceIcon,
  mechanized: mechanizedIcon,
  headquarters: headquartersIcon,
  engineer: engineerIcon,
};

// ──── SVG Generation ────

function drawEchelonMarks(echelon, markY) {
  if (!echelon) return "";
  const ech = ECHELONS[echelon];
  let marks = "";

  if (ech.bars > 0) {
    const spacing = 10;
    const total = (ech.bars - 1) * spacing;
    const sx = 100 - total / 2;
    for (let i = 0; i < ech.bars; i++) {
      const bx = sx + i * spacing;
      marks += `<line x1="${bx}" y1="${markY}" x2="${bx}" y2="${markY - 20}" stroke="black" stroke-width="4" stroke-linecap="round"/>`;
    }
  }

  if (ech.xMarks > 0) {
    const spacing = 18;
    const total = (ech.xMarks - 1) * spacing;
    const sx = 100 - total / 2;
    for (let i = 0; i < ech.xMarks; i++) {
      const mx = sx + i * spacing;
      marks += `<line x1="${mx - 7}" y1="${markY}" x2="${mx + 7}" y2="${markY - 18}" stroke="black" stroke-width="3.5" stroke-linecap="round"/>`;
      marks += `<line x1="${mx + 7}" y1="${markY}" x2="${mx - 7}" y2="${markY - 18}" stroke="black" stroke-width="3.5" stroke-linecap="round"/>`;
    }
  }

  return marks;
}

function generateIcon(side, unitType, echelon) {
  const { fill, stroke } = COLORS[side];
  const iconFn = UNIT_ICONS[unitType];
  const isAllied = side === "allied";

  const hasMarks = echelon && ECHELONS[echelon] &&
    (ECHELONS[echelon].bars > 0 || ECHELONS[echelon].xMarks > 0);
  const markSpace = hasMarks ? 35 : 0;
  const pad = 8;

  let frameCenterY, totalHeight, frame;

  if (isAllied) {
    const frameTop = pad + markSpace;
    frameCenterY = frameTop + 50;
    totalHeight = frameTop + 100 + pad;
    frame = `<rect x="20" y="${frameTop}" width="160" height="100" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="5"/>`;
  } else {
    const dHalf = 70;
    frameCenterY = pad + markSpace + dHalf;
    totalHeight = frameCenterY + dHalf + pad;
    frame = `<path d="M100,${frameCenterY - dHalf} L170,${frameCenterY} 100,${frameCenterY + dHalf} 30,${frameCenterY} Z" fill="${fill}" stroke="${stroke}" stroke-width="5"/>`;
  }

  const markY = pad + markSpace - 5;
  const marks = hasMarks ? drawEchelonMarks(echelon, markY) : "";
  const icon = iconFn(100, frameCenterY);

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 ${totalHeight}">`,
    marks,
    frame,
    icon,
    `</svg>`,
  ].join("\n");
}

// ──── Generate all icons ────
let count = 0;

for (const unitType of Object.keys(UNIT_ICONS)) {
  for (const side of ["allied", "axis"]) {
    for (const echelon of Object.keys(ECHELONS)) {
      const svg = generateIcon(side, unitType, echelon);
      writeFileSync(join(outDir, `${side}-${unitType}-${echelon}.svg`), svg);
      count++;
    }
    // Legend icon (no echelon marks)
    const svg = generateIcon(side, unitType, null);
    writeFileSync(join(outDir, `${side}-${unitType}.svg`), svg);
    count++;
  }
}

console.log(`Generated ${count} icons`);
