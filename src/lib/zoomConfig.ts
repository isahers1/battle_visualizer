import type { ZoomTierConfig, Echelon } from "@/types";

export const ZOOM_TIERS: ZoomTierConfig[] = [
  {
    tier: "strategic",
    minZoom: 0,
    maxZoom: 8,
    echelons: ["army_group", "army"],
  },
  {
    tier: "operational",
    minZoom: 8,
    maxZoom: 9.5,
    echelons: ["army_group", "army", "corps"],
  },
  {
    tier: "tactical",
    minZoom: 9.5,
    maxZoom: 11,
    echelons: ["army_group", "army", "corps", "division", "brigade"],
  },
  {
    tier: "detailed",
    minZoom: 11,
    maxZoom: 20,
    echelons: [
      "army_group",
      "army",
      "corps",
      "division",
      "brigade",
      "regiment",
      "battalion",
    ],
  },
];

export const ECHELON_MIN_ZOOM: Record<Echelon, number> = {
  army_group: 0,
  army: 0,
  corps: 8,
  division: 9.5,
  brigade: 9.5,
  regiment: 11,
  battalion: 11,
};

export const MAP_CONSTRAINTS = {
  minZoom: 8,
  maxZoom: 14,
};
