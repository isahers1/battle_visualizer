import type { StyleSpecification } from "maplibre-gl";

// Minimal terrain-only base map — no roads, no labels.
// CartoDB Positron (no labels) provides just coastlines, water, and land shapes.
// The retro warm look is applied via CSS filter on the map canvas.
export const openTopoMapStyle: StyleSpecification = {
  version: 8,
  sources: {
    "carto-tiles": {
      type: "raster",
      tiles: [
        "https://basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}@2x.png",
      ],
      tileSize: 256,
      attribution:
        '&copy; <a href="https://carto.com/">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>',
      maxzoom: 19,
    },
  },
  layers: [
    {
      id: "carto-layer",
      type: "raster",
      source: "carto-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};
