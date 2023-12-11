import path from "path";
import fs from "fs/promises";

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
  const traces = Bun.file(
    path.join(__dirname, "../data/traces-du-reseau-ferre-idf.geojson")
  );

  const { features } = await traces.json();

  return Bun.write(
    path.join(__dirname, "../data/routes.json"),
    JSON.stringify({
      type: "FeatureCollection",
      features: features.map((feature: any) => {
        const { geometry, properties } = feature;

        return {
          type: "Feature",
          geometry,
          properties: {
            id: properties.res_com,
            color: `#${properties.colourweb_hexa}`,
          },
        };
      }),
    })
  );
};

main();
