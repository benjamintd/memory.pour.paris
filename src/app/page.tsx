"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import data from "@/data/features-idf.json";
import Fuse from "fuse.js";
import { useLocalStorageValue, usePrevious } from "@react-hookz/web";
import mapboxgl from "mapbox-gl";
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
import { BEG_THRESHOLD, LINES } from "@/lib/constants";
import useHideLabels from "@/hooks/useHideLabels";
import augmentResults from "@/lib/augmentResults";
import getMode from "@/lib/getMode";
import StripeModal from "@/components/StripeModal";

export default function Home() {
  const [map, setMap] = useState<mapboxgl.Map | null>(null);
  const [hoveredId, setHoveredId] = useState<number | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const { hideLabels, setHideLabels } = useHideLabels(map);
  const [showStripeModal, setShowStripeModal] = useState<boolean>(false);
  const { value: enableAllNetwork, set: setEnableAllNetwork } =
    useLocalStorageValue<boolean>("enable-all-network", {
      defaultValue: false,
      initializeWithValue: false,
    });

  const { value: hasShownStripeModal, set: setHasShownStripeModal } =
    useLocalStorageValue<boolean>("has-shown-stripe-modal", {
      defaultValue: false,
      initializeWithValue: false,
    });

  const fc = useMemo(() => {
    const fc = data as IDFDataFeatureCollection;
    if (!enableAllNetwork) {
      fc.features = fc.features.filter((f) => f.properties.type === "METRO");
    }
    return { ...fc };
  }, [enableAllNetwork]);

  const idMap = useMemo(() => {
    const map = new Map<number, DataFeature>();
    fc.features.forEach((feature) => {
      map.set(feature.id! as number, feature);
    });
    return map;
  }, [fc]);

  const { value: localFound, set: setFound } = useLocalStorageValue<
    number[] | null
  >("paris-stations", {
    defaultValue: null,
    initializeWithValue: false,
  });

  const { value: legacyLocalFound, set: legacySetFound } = useLocalStorageValue<
    number[]
  >("paris-streets", {
    defaultValue: [],
    initializeWithValue: false,
  });

  useEffect(() => {
    if (legacyLocalFound && legacyLocalFound.length > 0 && !localFound) {
      window.alert(
        "La page a changé pour se concentrer sur les stations de métro. Vos stations existantes vont être importées.\n Vous pouvez trouver un lien vers l'ancien jeu avec les rues dans le menu."
      );
      setFound(augmentResults(legacyLocalFound, idMap, fc));
    }
  }, [legacyLocalFound, localFound, fc, idMap, setFound]);

  const { value: isNewPlayer, set: setIsNewPlayer } =
    useLocalStorageValue<boolean>("paris-streets-is-new-player", {
      defaultValue: true,
      initializeWithValue: false,
    });

  const found: number[] = useMemo(() => {
    return localFound || [];
  }, [localFound]);

  const previousFc = usePrevious(fc);
  useEffect(() => {
    if (previousFc !== fc && found.length > 0) {
      setFound(augmentResults(found, idMap, fc));
    }
  }, [fc, idMap, setFound, found, previousFc]);

  const onReset = useCallback(() => {
    if (
      confirm(
        "Vous allez perdre l'ensemble de votre progression. Êtes-vous sûr ?"
      )
    ) {
      setFound([]);
      legacySetFound([]);
      setIsNewPlayer(true);
      setHasShownStripeModal(false);
      setEnableAllNetwork(false);
    }
  }, [
    setFound,
    setIsNewPlayer,
    legacySetFound,
    setHasShownStripeModal,
    setEnableAllNetwork,
  ]);

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
    [fc]
  );

  useEffect(() => {
    if (map) {
      for (const layer of ["emplacement-des-gares", "traces-du-reseau-ferre"]) {
        map.setFilter(layer, [
          "all",
          ["match", ["get", "res_com"], Object.keys(LINES), true, false],
          ...(enableAllNetwork
            ? []
            : [["match", ["get", "mode"], ["METRO"], true, false]]),
        ]);
      }
    }
  }, [enableAllNetwork, map]);

  useEffect(() => {
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!;

    const mapboxMap = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/benjamintd/clneoq08i03y101r7ek1z305r",
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
  }, [setMap, fc]);

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

  const foundStationsPerMode = useMemo(() => {
    const stationsPerLine = fc.properties.stationsPerLine;
    let foundStationsPercentagePerMode: Record<string, number> = {};
    for (let line of Object.keys(foundStationsPerLine)) {
      const mode = getMode(line);

      if (!foundStationsPercentagePerMode[mode]) {
        foundStationsPercentagePerMode[mode] = 0;
      }

      foundStationsPercentagePerMode[mode] += foundStationsPerLine[line];
    }

    const stationsPerMode = Object.keys(stationsPerLine).reduce((acc, line) => {
      const mode = getMode(line);

      if (!acc[mode]) {
        acc[mode] = 0;
      }

      acc[mode] += stationsPerLine[line];

      return acc;
    }, {} as Record<string, number>);

    // normalize
    for (let mode of Object.keys(foundStationsPercentagePerMode)) {
      foundStationsPercentagePerMode[mode] /= stationsPerMode[mode];
    }

    return foundStationsPercentagePerMode;
  }, [foundStationsPerLine, fc]);

  useEffect(() => {
    if (foundStationsPerMode["METRO"] > BEG_THRESHOLD && !hasShownStripeModal) {
      // once we reach a certain threshold, we show the stripe modal
      // and unlock the rest of the game.
      setShowStripeModal(true);
      // setEnableAllNetwork(true);
      setHasShownStripeModal(true);
    }
  }, [
    hasShownStripeModal,
    setHasShownStripeModal,
    foundStationsPerMode,
    // setEnableAllNetwork,
    found,
    setFound,
    idMap,
    fc,
  ]);

  return (
    <main className="flex flex-row items-center justify-between h-screen">
      <div className="relative flex justify-center h-full grow">
        <div className="absolute top-0 left-0 w-full h-full" id="map" />
        <div className="absolute w-96 max-w-full px-1 h-12 top-4 lg:top-32">
          <FoundSummary
            className="mb-4 lg:hidden bg-white rounded-lg shadow-md p-4"
            foundStationsPerLine={foundStationsPerLine}
            stationsPerLine={fc.properties.stationsPerLine}
            foundStationsPerMode={foundStationsPerMode}
            minimizable
            defaultMinimized
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
              setFound={setFound}
              localStorageKey="paris-stations"
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
          foundStationsPerMode={foundStationsPerMode}
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
      <StripeModal
        metroFoundProportion={foundStationsPerMode["METRO"]}
        open={showStripeModal}
        setOpen={setShowStripeModal}
      />
    </main>
  );
}
