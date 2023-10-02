import * as path from "path";
import { Feature, FeatureCollection, LineString, Point } from "geojson";
import turf, { lineString } from "@turf/turf";
import { groupBy, mapValues } from "lodash";
import { promises as fs } from "fs";

const Bun = {
  file(path: string) {
    return {
      async json() {
        return JSON.parse(await fs.readFile(path, "utf8"));
      },
    };
  },

  async write(path: string, content: string) {
    await fs.writeFile(path, content, "utf8");
  },
};

const main = async () => {
  // --- STREETS ---

  const streets = Bun.file(path.join(__dirname, "../data/voies.geojson"));
  const collection = (await streets.json()) as FeatureCollection<
    LineString,
    {
      c_desi: string;
      l_courtmin: string;
      l_longmin: string;
      l_voie: string;
      length?: number;
      objectid?: number | string;
    }
  >;
  const featuresStreets = collection.features
    .map((feature) => {
      const length = turf.length(feature, { units: "kilometers" });
      const id = +`${200}${feature.properties.objectid}`;
      return {
        ...feature,
        properties: {
          length,
          short_name: feature.properties.l_courtmin,
          long_name: feature.properties.l_longmin,
          name: feature.properties.l_voie,
          type: feature.properties.c_desi,
          id,
        },
        id,
      };
    })
    .filter(
      (
        f: unknown
      ): f is Feature<
        LineString,
        {
          length: number;
          short_name: string;
          long_name: string;
          name: string;
          type: string;
          id: number | string;
        }
      > => !!f && !!(f as Feature).id
    );

  // --- STATIONS ---
  const stations = Bun.file(path.join(__dirname, "../data/stations.geojson"));

  const stationsCollection = (await stations.json()) as FeatureCollection<
    Point,
    { id_gares: number; nom_gares: string; res_com: string; nom_zdc: string }
  >;

  const featuresStations = stationsCollection.features
    .map((feature) => {
      const id = +`${100}${feature.properties.id_gares}`;
      return {
        ...feature,
        properties: {
          id,
          name: feature.properties.nom_gares,
          long_name: feature.properties.nom_zdc,
          type: "metro",
          line: feature.properties.res_com,
        },
        id,
      };
    })
    .filter((f) => f.properties.line.startsWith("METRO"));

  Bun.write(
    path.join(__dirname, "../data/features.json"),
    JSON.stringify({
      type: "FeatureCollection",
      features: [...featuresStreets, ...featuresStations],
      properties: {
        totalLength: featuresStreets.reduce((acc, feature) => {
          return acc + feature.properties!.length;
        }, 0),
        totalStations: featuresStations.length,
        stationsPerLine: mapValues(
          groupBy(featuresStations, (feature) => feature.properties!.line),
          (stations) => stations.length
        ),
      },
    })
  );
};

main();
