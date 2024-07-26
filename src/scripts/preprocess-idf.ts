import * as path from "path";
import { Feature, FeatureCollection, LineString, Point } from "geojson";
import turf from "@turf/turf";
import { groupBy, mapValues } from "lodash";
import { promises as fs } from "fs";
import { LINES } from "@/lib/constants";

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
  // --- STATIONS ---
  const stations = Bun.file(path.join(__dirname, "../data/emplacement-des-gares-idf.geojson"));

  const stationsCollection = (await stations.json()) as FeatureCollection<
    Point,
    {
      id_gares: number;
      nom_gares: string;
      res_com: string;
      nom_zdc: string;
      nom_zda: string;
      mode: string;
    }
  >;

  const availableLines = new Set(Object.keys(LINES));

  const featuresStations = stationsCollection.features
    .map((feature) => {
      let id = +`${100}${feature.properties.id_gares}`;
      // saint-cyr hotfix
      if (id === 1001252 && feature.properties.res_com === 'TRAM 13') {
        id = 10012521;
      }
      return {
        ...feature,
        properties: {
          id,
          name: feature.properties.nom_zdc,
          long_name: feature.properties.nom_gares,
          short_name: feature.properties.nom_zda,
          type: feature.properties.mode,
          line: feature.properties.res_com,
        },
        id,
      };
    })
    .filter((f) => availableLines.has(f.properties.line));

  Bun.write(
    path.join(__dirname, "../data/features-idf.json"),
    JSON.stringify({
      type: "FeatureCollection",
      features: featuresStations,
      properties: {
        totalStations: featuresStations.length,
        stationsPerLine: mapValues(
          groupBy(featuresStations, (feature) => feature.properties!.line),
          (stations) => stations.length
        ),
      },
    }, null, 2)
  );
};

main();
