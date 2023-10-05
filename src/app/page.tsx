"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import data from "@/data/features-idf.json";
import Fuse from "fuse.js";
import { useLocalStorageValue } from "@react-hookz/web";
import mapboxgl from "mapbox-gl";
import { sumBy } from "lodash";
import { coordEach } from "@turf/meta";
import "mapbox-gl/dist/mapbox-gl.css";
import "react-circular-progressbar/dist/styles.css";
import MenuComponent from "@/components/Menu";
import IntroModal from "@/components/IntroModal";
import removeAccents from "@/lib/removeAccents";
import FoundSummary from "@/components/FoundSummary";
import FoundList from "@/components/FoundList";
import { IDFDataFeatureCollection, DataFeature } from "@/lib/types";
import Input from "@/components/Input";
import { LINES } from "@/lib/constants";
import useHideLabels from "@/hooks/useHideLabels";

const fc = data as IDFDataFeatureCollection;

export default function Home() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { hideLabels, setHideLabels } = useHideLabels(map);

  const idMap = useMemo(() => {
    const map = new Map<number, DataFeature>();
    fc.features.forEach((feature) => {
      map.set(feature.id! as number, feature);
    });
    return map;
  }, []);

  const { value: legacyLocalFound, set: legacySetFound } = useLocalStorageValue<
    number[]
  >("paris-streets", {
    defaultValue: [],
    initializeWithValue: false,
  });

  const { value: localFound, set: setFound } = useLocalStorageValue<number[]>(
    "paris-stations",
    {
      defaultValue: [],
      initializeWithValue: false,
    }
  );

  useEffect(() => {
    const syncedFound: number[] = [];
    const syncedFoundSet = new Set(legacyLocalFound || []);
    // @todo synchronize to the new key, and add the stations that have the same name as already found ones.
    if (
      legacyLocalFound &&
      legacyLocalFound.length > 0 &&
      (localFound || []).length === 0
    ) {
      window.alert(
        "La page a changé pour inclure l'ensemble des lignes ferrées d'Ile de France. Vos stations existantes vont être importés.\n Vous pouvez trouver un lien vers l'ancien jeu dans le menu."
      );
      for (let i = 0; i < legacyLocalFound.length; i++) {
        const id = legacyLocalFound[i];
        const feature = idMap.get(id);
        if (!feature) continue;

        // search for features with similar names and add them to the list
        fc.features.forEach((f) => {
          if (
            f.properties.name === feature.properties.name &&
            f.id !== id &&
            !syncedFoundSet.has(+f.id!)
          ) {
            syncedFound.push(f.id! as number);
            syncedFoundSet.add(+f.id!);
          }
        });

        syncedFound.push(id);
        syncedFoundSet.add(id);
      }

      setFound(syncedFound);
    }
  }, [legacyLocalFound, setFound, localFound, idMap, legacySetFound]);

  const { value: isNewPlayer, set: setIsNewPlayer } =
    useLocalStorageValue<boolean>("paris-streets-is-new-player", {
      defaultValue: true,
      initializeWithValue: false,
    });

  const found: number[] = useMemo(() => {
    return localFound || [];
  }, [localFound]);

  const onReset = useCallback(() => {
    if (
      confirm(
        "Vous allez perdre l'ensemble de votre progression. Êtes-vous sûr ?"
      )
    ) {
      setFound([]);
      legacySetFound([]);
      setIsNewPlayer(true);
    }
  }, [setFound, setIsNewPlayer, legacySetFound]);

  const foundStationsPerLine = useMemo(() => {
    const foundStationsPerLine: { [key: string]: number } = {};
    for (let id of found || []) {
      const feature = idMap.get(id);
      if (!feature) {
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
        threshold: 0.15,
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

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const mapboxMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/benjamintd/clna5eqeb03go01qu5owb83oq",
      bounds: [
        [2.21, 48.815573],
        [2.47, 48.91],
      ],
      minZoom: 6,
      fadeDuration: 50,
    });

    mapboxMap.on("load", () => {
      mapboxMap.addSource("paris", {
        type: "geojson",
        data: fc,
      });

      mapboxMap.addSource("hovered", {
        type: "geojson",
        data: {
          type: "FeatureCollection",
          features: [],
        },
      });

      mapboxMap.addLayer({
        id: "metro-hovered",
        type: "circle",
        paint: {
          "circle-radius": 16,
          "circle-color": "#fde047",
          "circle-blur-transition": {
            duration: 100,
          },
          "circle-blur": 1,
        },
        source: "hovered",
        filter: ["==", "$type", "Point"],
      });

      mapboxMap.addLayer({
        type: "circle",
        source: "paris",
        id: "metro-circles",
        paint: {
          "circle-radius": [
            "interpolate",
            ["linear"],
            ["zoom"],
            9,
            ["case", ["to-boolean", ["feature-state", "found"]], 2, 1],
            16,
            ["case", ["to-boolean", ["feature-state", "found"]], 6, 4],
          ],
          "circle-color": [
            "case",
            ["to-boolean", ["feature-state", "found"]],
            [
              "match",
              ["get", "line"],
              ...Object.keys(LINES).flatMap((line) => [
                [line],
                LINES[line].color,
              ]),
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
              ...Object.keys(LINES).flatMap((line) => [
                [line],
                LINES[line].backgroundColor,
              ]),
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
        minzoom: 11,
        layout: {
          "text-field": ["to-string", ["get", "name"]],
          "text-font": ["Parisine Regular", "Arial Unicode MS Regular"],
          "text-anchor": "bottom",
          "text-offset": [0, -0.5],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 12, 22, 14],
        },
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

      mapboxMap.addLayer({
        id: "hover-label-point",
        type: "symbol",
        paint: {
          "text-halo-color": "rgb(255, 255, 255)",
          "text-halo-width": 2,
          "text-halo-blur": 1,
          "text-color": "rgb(29, 40, 53)",
        },
        layout: {
          "text-field": ["to-string", ["get", "name"]],
          "text-font": ["Parisine Bold", "Arial Unicode MS Regular"],
          "text-anchor": "bottom",
          "text-offset": [0, -0.6],
          "text-size": ["interpolate", ["linear"], ["zoom"], 11, 14, 22, 16],
          "symbol-placement": "point",
        },
        source: "hovered",
        filter: ["==", "$type", "Point"],
      });

      mapboxMap.once("data", () => {
        setMap((map) => (map === null ? mapboxMap : map));
      });

      mapboxMap.once("idle", () => {
        setMap((map) => (map === null ? mapboxMap : map));
        mapboxMap.on("mousemove", ["metro-circles"], (e) => {
          if (e.features && e.features.length > 0) {
            const feature = e.features.find((f) => f.state.found && f.id);
            if (feature && feature.id) {
              return setHoveredId(feature.id as number);
            }
          }

          setHoveredId(null);
        });

        mapboxMap.on("mouseleave", ["metro-circles"], () => {
          setHoveredId(null);
        });
      });
    });

    return () => {
      mapboxMap.remove();
    };
  }, [setMap]);

  useEffect(() => {
    if (!map) return;

    (map.getSource("hovered") as mapboxgl.GeoJSONSource).setData({
      type: "FeatureCollection",
      features: hoveredId ? [idMap.get(hoveredId)!] : [],
    });
  }, [map, hoveredId, idMap]);

  useEffect(() => {
    if (!map || !found) return;

    map.removeFeatureState({ source: "paris" });

    for (let id of found) {
      map.setFeatureState({ source: "paris", id }, { found: true });
    }
  }, [found, map]);

  const zoomToFeature = useCallback(
    (id: number) => {
      if (!map) return;

      const feature = idMap.get(id);
      if (!feature) return;

      if (feature.geometry.type === "Point") {
        map.flyTo({
          center: feature.geometry.coordinates as [number, number],
          zoom: 14,
        });
      } else {
        const bounds = new mapboxgl.LngLatBounds();
        coordEach(feature, (coord) => {
          bounds.extend(coord as [number, number]);
        });
        map.fitBounds(bounds, { padding: 100 });
      }
    },
    [map, idMap]
  );

  return (
    <main className="flex flex-row items-center justify-between h-screen">
      <div className="relative flex justify-center h-full grow">
        <div className="absolute top-0 left-0 w-full h-full" id="map" />
        <div className="absolute w-96 max-w-screen mx-2 h-12 top-4 lg:top-32">
          <FoundSummary
            className="mb-4 lg:hidden bg-white rounded-lg shadow-md p-4"
            foundStationsPerLine={foundStationsPerLine}
            stationsPerLine={fc.properties.stationsPerLine}
            minimizable
          />
          <div className="flex gap-2 lg:gap-4">
            <Input
              fuse={fuse}
              found={found}
              setFound={setFound}
              setIsNewPlayer={setIsNewPlayer}
              inputRef={inputRef}
              map={map}
              idMap={idMap}
            />
            <MenuComponent
              onReset={onReset}
              hideLabels={hideLabels}
              setHideLabels={setHideLabels}
            />
          </div>
        </div>
      </div>
      <div className="h-full p-6 z-10 overflow-y-auto xl:w-[32rem] lg:w-96 hidden shadow-lg lg:block bg-blue-50">
        <FoundSummary
          foundStationsPerLine={foundStationsPerLine}
          stationsPerLine={fc.properties.stationsPerLine}
          minimizable
        />
        <hr className="w-full border-b border-blue-100 my-4" />
        <FoundList
          found={found}
          idMap={idMap}
          setHoveredId={setHoveredId}
          hoveredId={hoveredId}
          hideLabels={hideLabels}
          zoomToFeature={zoomToFeature}
        />
      </div>
      <IntroModal
        inputRef={inputRef}
        open={isNewPlayer}
        setOpen={setIsNewPlayer}
      >
        Tapez le nom d&apos;une station de métro, puis appuyez sur Entrée.
      </IntroModal>
    </main>
  );
}
