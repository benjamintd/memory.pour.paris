"use client";

import {
  KeyboardEventHandler,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import data from "../../public/data/features.json";
import Fuse from "fuse.js";
import { useLocalStorageValue } from "@react-hookz/web";
import { FeatureCollection, LineString, MultiLineString, Point } from "geojson";
import mapboxgl from "mapbox-gl";
import { range, sumBy } from "lodash";
import { Transition } from "@headlessui/react";
import classNames from "classnames";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";

import "mapbox-gl/dist/mapbox-gl.css";
import "react-circular-progressbar/dist/styles.css";
import StreetIcon from "@/components/StreetIcon";
import MenuComponent from "@/components/Menu";

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
> & {
  properties: {
    totalLength: number;
    totalStations: number;
    stationsPerLine: { [key: string]: number };
  };
};

const METRO_COLORS: { [key: string]: string } = {
  "METRO 1": "#ffce00",
  "METRO 2": "#0064b0",
  "METRO 3": "#9f9825",
  "METRO 3bis": "#98d4e2",
  "METRO 4": "#c04191",
  "METRO 5": "#f28e42",
  "METRO 6": "#83c491",
  "METRO 7": "#f3a4ba",
  "METRO 7bis": "#83c491",
  "METRO 8": "#ceadd2",
  "METRO 9": "#d5c900",
  "METRO 10": "#e3b32a",
  "METRO 11": "#8d5e2a",
  "METRO 12": "#00814f",
  "METRO 13": "#98d4e2",
  "METRO 14": "#662483",
};

const METRO_TEXT_COLORS: { [key: string]: string } = {
  "METRO 1": "#222",
  "METRO 2": "#fff",
  "METRO 3": "#fff",
  "METRO 3bis": "#222",
  "METRO 4": "#fff",
  "METRO 5": "#222",
  "METRO 6": "#222",
  "METRO 7": "#222",
  "METRO 7bis": "#222",
  "METRO 8": "#222",
  "METRO 9": "#222",
  "METRO 10": "#222",
  "METRO 11": "#fff",
  "METRO 12": "#fff",
  "METRO 13": "#222",
  "METRO 14": "#fff",
};

const METRO_LINES = [
  "METRO 1",
  "METRO 2",
  "METRO 3",
  "METRO 3bis",
  "METRO 4",
  "METRO 5",
  "METRO 6",
  "METRO 7",
  "METRO 7bis",
  "METRO 8",
  "METRO 9",
  "METRO 10",
  "METRO 11",
  "METRO 12",
  "METRO 13",
  "METRO 14",
];

const LINE_NAMES: { [key: string]: string } = {
  "METRO 1": "1",
  "METRO 2": "2",
  "METRO 3": "3",
  "METRO 3bis": "3b",
  "METRO 4": "4",
  "METRO 5": "5",
  "METRO 6": "6",
  "METRO 7": "7",
  "METRO 7bis": "7b",
  "METRO 8": "8",
  "METRO 9": "9",
  "METRO 10": "10",
  "METRO 11": "11",
  "METRO 12": "12",
  "METRO 13": "13",
  "METRO 14": "14",
};

export default function Home() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [search, setSearch] = useState<string>("");
  const inputRef = useRef<HTMLInputElement | null>(null);

  const idMap = useMemo(() => {
    const map = new Map();
    fc.features.forEach((feature) => {
      map.set(feature.id, feature);
    });
    return map;
  }, []);

  const { value: found, set: setFound } = useLocalStorageValue<number[]>(
    "paris-streets",
    {
      defaultValue: [],
      initializeWithValue: false,
    }
  );

  const onReset = useCallback(() => {
    if (confirm("Vous allez perdre votre progression. Êtes-vous sûr ?")) {
      setFound([]);
    }
  }, [setFound]);

  const foundStreetsPercentage = useMemo(() => {
    return sumBy(
      found,
      (id) =>
        (idMap.get(id)?.properties.length || 0) / fc.properties.totalLength
    );
  }, [found, idMap]);

  const foundStationsPercentage = useMemo(() => {
    return sumBy(
      found,
      (id) =>
        (idMap.get(id)?.properties.type === "metro" ? 1 : 0) /
        fc.properties.totalStations
    );
  }, [found, idMap]);

  const foundStationsPerLine = useMemo(() => {
    const foundStationsPerLine: { [key: string]: number } = {};
    for (let id of found || []) {
      const feature = idMap.get(id);
      if (!feature || feature.properties.type !== "metro") {
        continue;
      }
      const line = feature.properties.line;
      if (!line) {
        continue;
      }
      foundStationsPerLine[line] = (foundStationsPerLine[line] || 0) + 1;
    }

    return foundStationsPerLine;
  }, [found, idMap]);

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

      setFound([...matches, ...(found || [])]);

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
        minZoom: 11,
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
            "line-width": [
              "interpolate",
              ["linear"],
              ["zoom"],
              12,
              ["case", ["to-boolean", ["feature-state", "found"]], 2, 1],
              16,
              ["case", ["to-boolean", ["feature-state", "found"]], 6, 4],
            ],
          },
          layout: {
            "line-join": "round",
            "line-cap": "round",
            "line-sort-key": ["get", "length"],
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

        mapboxMap.addLayer({
          id: "voies-labels",
          type: "symbol",
          paint: {
            "text-halo-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              "rgb(255, 255, 255)",
              "rgba(0, 0, 0, 0)",
            ],
            "text-halo-width": 2,
            "text-halo-blur": 1,
            "text-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              "rgb(120, 132, 127)",
              "rgba(0, 0, 0, 0)",
            ],
          },
          layout: {
            "text-field": ["to-string", ["get", "short_name"]],
            "text-font": ["Parisine Regular", "Arial Unicode MS Regular"],
            "symbol-placement": "line",
            "symbol-avoid-edges": true,
            "text-size": ["interpolate", ["linear"], ["zoom"], 11, 12, 22, 16],
          },
          source: "paris",
          filter: ["==", "$type", "LineString"],
        });

        mapboxMap.addLayer({
          minzoom: 11,
          layout: {
            "text-field": ["to-string", ["get", "name"]],
            "text-font": ["Parisine Regular", "Arial Unicode MS Regular"],
            "text-anchor": "bottom",
            "text-offset": [0, -0.5],
            "text-size": ["interpolate", ["linear"], ["zoom"], 11, 12, 22, 14],
          },
          filter: ["match", ["get", "type"], ["metro"], true, false],
          type: "symbol",
          source: "paris",
          id: "metro-labels",
          paint: {
            "text-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              "rgb(29, 40, 53)",
              "rgba(0, 0, 0, 0)",
            ],
            "text-halo-color": [
              "case",
              ["to-boolean", ["feature-state", "found"]],
              "rgba(255, 255, 255, 0.8)",
              "rgba(0, 0, 0, 0)",
            ],
            "text-halo-blur": 1,
            "text-halo-width": 1,
          },
        });

        mapboxMap.once("idle", () => setMap(mapboxMap));
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
        <div className="absolute w-96 max-w-screen h-12 top-32 flex gap-4">
          <input
            className="grow px-4 py-2 rounded-full text-lg font-bold shadow-lg text-blue-900 outline-none focus:ring-2 ring-blue-800 caret-current"
            ref={inputRef}
            placeholder="Rue ou station de métro"
            value={search}
            // @ts-ignore
            onChange={(e) => setSearch((e.target as HTMLInputElement).value)}
            id="input"
            type="text"
            autoFocus
            onKeyDown={onKeyDown}
          ></input>
          <MenuComponent onReset={onReset} />
        </div>
      </div>
      <div className="h-full p-6 overflow-y-auto xl:w-[32rem] lg:w-96 hidden shadow-lg lg:block bg-blue-50">
        <p className="text-xl font-bold">
          {(foundStreetsPercentage * 100).toFixed(1)}%
        </p>
        <p className="text-sm mb-2">kilomètres de rues trouvés</p>
        <div className="w-full grid grid-cols-[20] grid-rows-1 grid-flow-col gap-1 mb-4">
          {range(0, 20).map((i) => (
            <div
              key={i}
              className={classNames("h-6 w-full col-span-1 shadow-sm", {
                "bg-blue-600": i < foundStreetsPercentage * 20,
                "bg-white": i >= foundStreetsPercentage * 20,
              })}
            ></div>
          ))}
        </div>
        <p className="text-xl font-bold">
          {(foundStationsPercentage * 100).toFixed(1)}%
        </p>
        <p className="text-sm mb-2">des stations de métro trouvées</p>
        <div className="grid grid-cols-[8] grid-rows-2 grid-flow-col gap-1 mb-4">
          {METRO_LINES.map((line) => {
            return (
              <div
                key={line}
                className="relative lg:h-8 xl:h-12 aspect-square flex items-center justify-center"
              >
                <div className="absolute w-full h-full z-20">
                  <CircularProgressbar
                    background
                    backgroundPadding={2}
                    styles={buildStyles({
                      backgroundColor: METRO_COLORS[line],
                      pathColor: METRO_TEXT_COLORS[line],
                      trailColor: "transparent",
                    })}
                    value={
                      (100 * (foundStationsPerLine[line] || 0)) /
                      fc.properties.stationsPerLine[line]
                    }
                  />
                </div>
                <span
                  className="block text-lg font-bold z-30"
                  style={{ color: METRO_TEXT_COLORS[line] }}
                >
                  {LINE_NAMES[line]}
                </span>
              </div>
            );
          })}
        </div>
        <hr className="w-full border-b border-blue-100 my-4" />
        <ol>
          {(found || []).map((id) => {
            const feature = idMap.get(id);
            if (!feature) return null;
            return (
              <Transition
                appear={true}
                as="li"
                key={id}
                show={true}
                className="text-sm flex items-center"
                enter="transition-all duration-250"
                enterFrom="h-0 opacity-0"
                enterTo="h-6 opacity-100"
                leave="transition-opacity duration-250"
                leaveFrom="h-6 opacity-100"
                leaveTo="h-0 opacity-0"
              >
                {feature.properties.line ? (
                  <span
                    className="w-5 h-5 rounded-full font-bold text-xs flex items-center justify-center mr-2"
                    style={{
                      backgroundColor: METRO_COLORS[feature.properties.line],
                      color: METRO_TEXT_COLORS[feature.properties.line],
                    }}
                  >
                    {LINE_NAMES[feature.properties.line]}
                  </span>
                ) : (
                  <StreetIcon className="w-5 h-5 mr-2" />
                )}
                {feature.properties.long_name || feature.properties.name}
              </Transition>
            );
          })}
        </ol>
      </div>
    </main>
  );
}

export const removeAccents = (str?: string) =>
  (str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036F]/g, "")
    .replace(/st /g, "saint ")
    .replace(/st-/g, "saint-");
