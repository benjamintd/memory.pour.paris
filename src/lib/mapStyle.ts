import { StyleSpecification } from "maplibre-gl";

/**
 * Token-free MapLibre base style for Paris de tête.
 *
 * Vector tiles come from the Protomaps hosted API (the key below is
 * origin-locked to localhost + memory.pour.paris, so it is safe to ship
 * client-side — same pattern as chronotrains.com). Glyphs are self-hosted
 * Jost; sprites come from the Protomaps basemap assets.
 *
 * The layer set is ported from chronotrains.com's hand-rolled Protomaps
 * theme, recolored from its slate/gray palette to the light-blue look of the
 * original Mapbox style this project used to load.
 */

const PROTOMAPS_KEY = "e6b2ae8c66a2352e";

// Light-blue palette (replaces chronotrains' slate ramp).
const C = {
  earth: "#eaf2fa", // land fill
  water: "#8eb3e1", // water + rivers/streams
  park: "#dcead9", // parks / forests (a touch of green)
  surface: "#e4eef9", // buildings, minor surfaces (was #f1f5f9)
  surfaceLight: "#eef5fc", // lightest landuse (was #f8fafc)
  roadFill: "#cfe1f3", // road bodies (was #e2e8f0)
  roadFillSoft: "#dbe8f6", // softer road bodies (was #cbd5e1 on roads)
  casing: "#ffffff", // road casings
  rail: "#b9cae0", // rail lines (kept faint so the metro network stands out)
  textMuted: "#7b99c2", // minor labels / boundaries (was #94a3b8)
  textMid: "#5b7298", // major road / locality labels (was #64748b)
  textDark: "#3d5170", // dense locality labels (was #475569)
  halo: "#ffffff",
} as const;

export function buildBaseStyle(): StyleSpecification {
  return {
    version: 8,
    glyphs: "https://benjamintd.github.io/fonts/Jost/{fontstack}/{range}.pbf",
    sprite: "https://protomaps.github.io/basemaps-assets/sprites/v4/light",
    sources: {
      protomaps: {
        type: "vector",
        url: `https://api.protomaps.com/tiles/v4.json?key=${PROTOMAPS_KEY}`,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>',
      },
    },
    layers: [
      {
        id: "background",
        type: "background",
        paint: {
          "background-color": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            "rgb(234, 242, 250)",
            11,
            "rgb(216, 231, 246)",
          ],
        },
      },
      {
        id: "earth",
        type: "fill",
        filter: ["==", ["geometry-type"], "Polygon"],
        source: "protomaps",
        "source-layer": "earth",
        paint: { "fill-color": C.earth },
      },
      {
        id: "landuse_park",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        filter: [
          "in",
          "kind",
          "national_park",
          "park",
          "cemetery",
          "protected_area",
          "nature_reserve",
          "forest",
          "golf_course",
          "wood",
          "scrub",
          "grassland",
          "grass",
        ],
        paint: {
          "fill-opacity": ["interpolate", ["linear"], ["zoom"], 6, 0, 11, 1],
          "fill-color": C.park,
        },
      },
      {
        id: "landuse_urban_green",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        filter: ["in", "kind", "allotments", "village_green", "playground"],
        paint: { "fill-color": C.park, "fill-opacity": 0.7 },
      },
      {
        id: "landuse_surfaces",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        filter: [
          "in",
          "kind",
          "hospital",
          "industrial",
          "school",
          "university",
          "college",
          "zoo",
          "aerodrome",
          "pedestrian",
        ],
        paint: { "fill-color": C.surfaceLight },
      },
      {
        id: "landuse_runway",
        type: "fill",
        source: "protomaps",
        "source-layer": "landuse",
        filter: ["any", ["in", "kind", "runway", "taxiway", "pier", "beach"]],
        paint: { "fill-color": C.surface },
      },
      {
        id: "water",
        type: "fill",
        filter: ["==", ["geometry-type"], "Polygon"],
        source: "protomaps",
        "source-layer": "water",
        paint: { "fill-color": C.water },
      },
      {
        id: "water_stream",
        type: "line",
        source: "protomaps",
        "source-layer": "water",
        minzoom: 14,
        filter: ["in", "kind", "stream"],
        paint: { "line-color": C.water, "line-width": 0.5 },
      },
      {
        id: "water_river",
        type: "line",
        source: "protomaps",
        "source-layer": "water",
        minzoom: 9,
        filter: ["in", "kind", "river"],
        paint: {
          "line-color": C.water,
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            9,
            0,
            9.5,
            1,
            18,
            12,
          ],
        },
      },
      {
        id: "buildings",
        type: "fill",
        source: "protomaps",
        "source-layer": "buildings",
        paint: { "fill-color": C.surface, "fill-opacity": 0.5 },
      },
      {
        id: "roads_tunnels_minor",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["all", ["has", "is_tunnel"], ["==", "kind", "minor_road"]],
        paint: {
          "line-color": C.roadFillSoft,
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            11,
            0,
            12.5,
            0.5,
            15,
            2,
            18,
            11,
          ],
        },
      },
      {
        id: "roads_tunnels_major",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["all", ["has", "is_tunnel"], ["==", "kind", "major_road"]],
        paint: {
          "line-color": C.roadFillSoft,
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            6,
            0,
            12,
            1.6,
            15,
            3,
            18,
            13,
          ],
        },
      },
      {
        id: "roads_minor_casing",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: [
          "all",
          ["!has", "is_tunnel"],
          ["!has", "is_bridge"],
          ["==", "kind", "minor_road"],
          ["!=", "kind_detail", "service"],
        ],
        paint: {
          "line-color": C.casing,
          "line-gap-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            11,
            0,
            12.5,
            0.5,
            15,
            2,
            18,
            11,
          ],
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            12,
            0,
            12.5,
            1,
          ],
        },
      },
      {
        id: "roads_major_casing",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        minzoom: 9,
        filter: [
          "all",
          ["!has", "is_tunnel"],
          ["!has", "is_bridge"],
          ["==", "kind", "major_road"],
        ],
        paint: {
          "line-color": C.casing,
          "line-gap-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            6,
            0,
            12,
            1.6,
            15,
            3,
            18,
            13,
          ],
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            9,
            0,
            9.5,
            1,
          ],
        },
      },
      {
        id: "roads_highway_casing",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: [
          "all",
          ["!has", "is_tunnel"],
          ["!has", "is_bridge"],
          ["==", "kind", "highway"],
          ["!has", "is_link"],
        ],
        paint: {
          "line-color": C.casing,
          "line-gap-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            3,
            0,
            3.5,
            0.5,
            18,
            15,
          ],
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            7,
            0,
            7.5,
            1,
            20,
            15,
          ],
        },
      },
      {
        id: "roads_minor",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: [
          "all",
          ["!has", "is_tunnel"],
          ["!has", "is_bridge"],
          ["==", "kind", "minor_road"],
        ],
        paint: {
          "line-color": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            11,
            C.roadFill,
            16,
            C.surface,
          ],
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            11,
            0,
            12.5,
            0.5,
            15,
            2,
            18,
            11,
          ],
        },
      },
      {
        id: "roads_major",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: [
          "all",
          ["!has", "is_tunnel"],
          ["!has", "is_bridge"],
          ["==", "kind", "major_road"],
        ],
        paint: {
          "line-color": C.roadFill,
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            6,
            0,
            12,
            1.6,
            15,
            3,
            18,
            13,
          ],
        },
      },
      {
        id: "roads_highway",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: [
          "all",
          ["!has", "is_tunnel"],
          ["!has", "is_bridge"],
          ["==", "kind", "highway"],
          ["!has", "is_link"],
        ],
        paint: {
          "line-color": C.roadFill,
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            3,
            0,
            6,
            1.1,
            12,
            1.6,
            15,
            5,
            18,
            15,
          ],
        },
      },
      {
        id: "roads_rail",
        type: "line",
        source: "protomaps",
        "source-layer": "roads",
        filter: ["==", "kind", "rail"],
        paint: {
          "line-opacity": 0.35,
          "line-color": C.rail,
          "line-width": [
            "interpolate",
            ["exponential", 1.6],
            ["zoom"],
            3,
            0,
            6,
            0.8,
            18,
            3,
          ],
        },
      },
      {
        id: "boundaries_country",
        type: "line",
        source: "protomaps",
        "source-layer": "boundaries",
        filter: ["<=", "kind_detail", 2],
        paint: { "line-color": C.textMuted, "line-width": 1 },
      },
      {
        id: "boundaries",
        type: "line",
        source: "protomaps",
        "source-layer": "boundaries",
        filter: [">", "kind_detail", 2],
        paint: {
          "line-color": C.textMuted,
          "line-width": 0.5,
          "line-dasharray": [3, 2],
        },
      },
      // No base-map labels: this is a name-guessing game, so the base style
      // must not reveal any place / street / water / neighbourhood names.
      // The only text on the map comes from the game's own layers (found
      // station names + hover labels), added in the page components.
    ],
  };
}
