import { DataFeature, IDFDataFeatureCollection } from "./types";

const augmentResults = (
  currentFound: number[],
  idMap: Map<number, DataFeature>,
  fc: IDFDataFeatureCollection
) => {
  const syncedFound: number[] = [];
  const syncedFoundSet = new Set(currentFound || []);
  for (let i = 0; i < currentFound.length; i++) {
    const id = currentFound[i];
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

  return syncedFound;
};

export default augmentResults;
