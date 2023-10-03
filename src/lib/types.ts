import { FeatureCollection, MultiLineString, LineString, Point } from "geojson";

export type SortOptionType = "order" | "name" | "length" | "line";

export type DataFeatureCollection = FeatureCollection<
  LineString | MultiLineString | Point,
  {
    type: string;
    name: string;
    id?: number | null;
    long_name?: string;
    short_name?: string;
    line?: string;
    length?: number;
  }
> & {
  properties: {
    totalLength: number;
    totalStations: number;
    stationsPerLine: { [key: string]: number };
  };
};

export type IDFDataFeatureCollection = FeatureCollection<
  LineString | MultiLineString | Point,
  {
    type: string;
    name: string;
    id?: number | null;
    long_name?: string;
    short_name?: string;
    line?: string;
    length?: number;
  }
> & {
  properties: {
    totalStations: number;
    stationsPerLine: { [key: string]: number };
  };
};

export type DataFeature = DataFeatureCollection["features"][number];

export interface SortOption {
  name: string;
  id: SortOptionType;
  shortName: React.ReactNode;
}
