export type LatLng = { latitude: number; longitude: number };

/** One forest beat outer ring (simplified for map + distance). */
export type BeatPolygon = {
  id: number;
  bbox: [minLng: number, minLat: number, maxLng: number, maxLat: number];
  ring: LatLng[];
};

export type BeatsPolygonsCacheFile = {
  version: number;
  polygons: BeatPolygon[];
};
