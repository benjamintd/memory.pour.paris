"use client";

import {
  KeyboardEventHandler,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import data from "../../public/data/features.json";
import Fuse from "fuse.js";
import { useLocalStorage } from "react-use";
import { FeatureCollection, LineString, MultiLineString, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const fc = data as FeatureCollection<
  LineString | MultiLineString | Point,
  {
    type: string;
    name: string;
    id?: number | null;
    long_name?: string;
    short_name?: string;
    line?: string;
  }
>;

export default function Home() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [search, setSearch] = useState<string>("");

  const idMap = useMemo(() => {
    const map = new Map();
    fc.features.forEach((feature) => {
      map.set(feature.id, feature);
    });
    return map;
  }, []);

  const [found, setFound] = useLocalStorage<number[]>("paris-streets", []);

  const fuse = useMemo(
    () =>
      new Fuse(fc.features, {
        includeScore: true,
        includeMatches: true,
        keys: [
          "properties.long_name",
          "properties.short_name",
          "properties.name",
        ],
        minMatchCharLength: 2,
        threshold: 0.1,
        distance: 10,
        getFn: (obj, path) => {
          const value = Fuse.config.getFn(obj, path);
          if (Array.isArray(value)) {
            return value.map((el) => removeAccents(el));
          } else {
            return removeAccents(value as string);
          }
        },
      }),
    []
  );

  const onKeyDown: KeyboardEventHandler<HTMLInputElement> = useCallback(
    (e) => {
      if (e.key !== "Enter") return;
      if (!search) return;

      e.preventDefault();
      const results = fuse.search(removeAccents(search));

      const matches: number[] = [];
      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (
          result.matches &&
          result.matches.length &&
          result.matches.some(
            (match) =>
              match.indices[0][0] < 2 &&
              match.value!.length - match.indices[match.indices.length - 1][1] <
                3
          ) &&
          (found || []).indexOf(+result.item.id!) === -1
        ) {
          matches.push(+result.item.id!);
        }
      }

      setFound([...(found || []), ...matches]);

      setSearch("");
    },
    [search, setSearch, fuse, found, setFound]
  );

  useEffect(() => {
    if (!map) {
      mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

      const mapboxMap = new mapboxgl.Map({
        container: "map",
        style: "mapbox://styles/benjamintd/clmyn184e02ty01r49vd07lm1",
        bounds: [
          [2.21, 48.815573],
          [2.47, 48.91],
        ],
        zoom: 12,
      });

      mapboxMap.on("load", () => {
        mapboxMap.addSource("paris", {
          type: "geojson",
          data: fc,
        });

        mapboxMap.addLayer({
          id: "voies",
          type: "line",
          paint: {
            "line-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              "#1c6dca",
              "rgb(208, 216, 225)",
            ],
            "line-width": ["interpolate", ["linear"], ["zoom"], 12, 1, 16, 4],
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
          },
          source: "paris",
          filter: ["==", "$type", "LineString"],
        });

        mapboxMap.addLayer({
          id: "voies-labels",
          type: "symbol",
          paint: {
            "text-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              "rgb(103, 114, 126)",
              "rgba(0, 0, 0, 0)",
            ],
          },
          layout: {
            "text-field": ["to-string", ["get", "short_name"]],
            "symbol-placement": "line",
            "symbol-avoid-edges": true,
            "text-size": ["interpolate", ["linear"], ["zoom"], 11, 13, 22, 16],
          },
          source: "paris",
          filter: ["==", "$type", "LineString"],
        });

        mapboxMap.addLayer({
          filter: ["match", ["get", "type"], ["metro"], true, false],
          type: "circle",
          source: "paris",
          id: "metro-circles",
          paint: {
            "circle-radius": ["interpolate", ["linear"], ["zoom"], 9, 1, 16, 4],

            "circle-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              [
                "match",
                ["get", "line"],
                ["METRO 1"],
                "#ffce00",
                ["METRO 2"],
                "#0064b0",
                ["METRO 3"],
                "#9f9825",
                ["METRO 3bis"],
                "#98d4e2",
                ["METRO 4"],
                "#c04191",
                ["METRO 5"],
                "#f28e42",
                ["METRO 6"],
                "#83c491",
                ["METRO 7"],
                "#f3a4ba",
                ["METRO 7bis"],
                "#83c491",
                ["METRO 8"],
                "#ceadd2",
                ["METRO 9"],
                "#d5c900",
                ["METRO 10"],
                "#e3b32a",
                ["METRO 11"],
                "#8d5e2a",
                ["METRO 12"],
                "#00814f",
                ["METRO 13"],
                "#98d4e2",
                ["METRO 14"],
                "#662483",
                "rgba(255, 255, 255, 0.8)",
              ],
              "rgba(255, 255, 255, 0.8)",
            ],
            "circle-stroke-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              [
                "match",
                ["get", "line"],
                ["METRO 1"],
                "#806700",
                ["METRO 2"],
                "#003258",
                ["METRO 3"],
                "#4f4c12",
                ["METRO 3bis"],
                "#2a7f93",
                ["METRO 4"],
                "#602049",
                ["METRO 5"],
                "#90440a",
                ["METRO 6"],
                "#356f41",
                ["METRO 7"],
                "#b41843",
                ["METRO 7bis"],
                "#356f41",
                ["METRO 8"],
                "#76447c",
                ["METRO 9"],
                "#6a6400",
                ["METRO 10"],
                "#775c10",
                ["METRO 11"],
                "#462f15",
                ["METRO 12"],
                "#004027",
                ["METRO 13"],
                "#2a7f93",
                ["METRO 14"],
                "#331241",
                "rgba(255, 255, 255, 0.8)",
              ],
              "rgba(255, 255, 255, 0.8)",
            ],
            "circle-stroke-width": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              1,
              0,
            ],
          },
        });

        setMap(mapboxMap);
      });
    }
  }, [map]);

  useEffect(() => {
    if (!map || !found) return;

    map.removeFeatureState({ source: "paris" });

    for (let id of found) {
      map.setFeatureState({ source: "paris", id }, { found: true });
    }
  }, [found, map]);

  return (
    <main className="flex flex-row items-center justify-between h-screen">
      <div className="relative flex justify-center h-full grow">
        <div className="absolute top-0 left-0 w-full h-full" id="map" />

        <input
          value={search}
          // @ts-ignore
          onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
          id="input"
          type="text"
          autoFocus
          className="absolute w-64 h-12 px-4 py-2 top-32"
          onKeyDown={onKeyDown}
        ></input>
      </div>
      <div className="h-full p-6 overflow-y-auto w-96">
        <button
          onClick={() => {
            setFound([]);
          }}
        >
          reset
        </button>
        <ol>
          {(found || []).map((id) => {
            const feature = idMap.get(id);
            if (!feature) return null;
            return (
              <li key={id}>
                {feature.properties.line
                  ? `${feature.properties.line.toLowerCase()} - `
                  : ""}
                {feature.properties.long_name || feature.properties.name}
              </li>
            );
          })}
        </ol>
      </div>
    </main>
  );
}
function lower(name: string): string {
  return name.toLowerCase();
}

export const removeAccents = (str?: string) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/st /g, "saint ")
    .replace(/st-/g, "saint-");
