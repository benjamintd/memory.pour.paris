import mapboxgl from "mapbox-gl";
import { useEffect, useState } from "react";

const useHideLabels = (map: mapboxgl.Map | null) => {
  const [hideLabels, setHideLabels] = useState<boolean>(false);

  useEffect(() => {
    if (map && hideLabels) {
      map.setLayoutProperty("voies-labels", "visibility", "none");
      map.setLayoutProperty("metro-labels", "visibility", "none");
    } else if (map) {
      map.setLayoutProperty("voies-labels", "visibility", "visible");
      map.setLayoutProperty("metro-labels", "visibility", "visible");
    }
  }, [hideLabels, map]);

  return { hideLabels, setHideLabels };
};

export default useHideLabels;
