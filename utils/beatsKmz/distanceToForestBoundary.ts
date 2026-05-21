import haversine from "haversine-distance";

import { BeatPolygon, LatLng } from "./types";

function pointToSegmentMeters(
  point: LatLng,
  a: LatLng,
  b: LatLng
): number {
  const px = point.longitude;
  const py = point.latitude;
  const ax = a.longitude;
  const ay = a.latitude;
  const bx = b.longitude;
  const by = b.latitude;

  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) {
    return haversine(
      { latitude: py, longitude: px },
      { latitude: ay, longitude: ax }
    );
  }

  let t = ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy);
  t = Math.max(0, Math.min(1, t));
  const closest = { latitude: ay + t * dy, longitude: ax + t * dx };
  return haversine(
    { latitude: py, longitude: px },
    { latitude: closest.latitude, longitude: closest.longitude }
  );
}

function distanceToRingBoundaryMeters(point: LatLng, ring: LatLng[]): number {
  let min = Infinity;
  for (let i = 0; i < ring.length; i++) {
    const a = ring[i];
    const b = ring[(i + 1) % ring.length];
    const d = pointToSegmentMeters(point, a, b);
    if (d < min) min = d;
  }
  return min;
}

export function distanceMetersToPolygonBoundary(
  lat: number,
  lng: number,
  polygon: BeatPolygon
): number {
  const point: LatLng = { latitude: lat, longitude: lng };
  return distanceToRingBoundaryMeters(point, polygon.ring);
}

const GRID_CELL_DEG = 0.2;

function gridKey(lat: number, lng: number): string {
  const latCell = Math.floor(lat / GRID_CELL_DEG);
  const lngCell = Math.floor(lng / GRID_CELL_DEG);
  return `${latCell},${lngCell}`;
}

export type BeatSpatialIndex = Map<string, number[]>;

export function buildBeatSpatialIndex(polygons: BeatPolygon[]): BeatSpatialIndex {
  const index: BeatSpatialIndex = new Map();
  polygons.forEach((poly, idx) => {
    const [minLng, minLat, maxLng, maxLat] = poly.bbox;
    const minLatCell = Math.floor(minLat / GRID_CELL_DEG);
    const maxLatCell = Math.floor(maxLat / GRID_CELL_DEG);
    const minLngCell = Math.floor(minLng / GRID_CELL_DEG);
    const maxLngCell = Math.floor(maxLng / GRID_CELL_DEG);
    for (let latC = minLatCell; latC <= maxLatCell; latC++) {
      for (let lngC = minLngCell; lngC <= maxLngCell; lngC++) {
        const key = `${latC},${lngC}`;
        const bucket = index.get(key);
        if (bucket) bucket.push(idx);
        else index.set(key, [idx]);
      }
    }
  });
  return index;
}

function candidatePolygonIndicesInRadius(
  lat: number,
  lng: number,
  index: BeatSpatialIndex,
  cellRadius: number
): number[] {
  const latCell = Math.floor(lat / GRID_CELL_DEG);
  const lngCell = Math.floor(lng / GRID_CELL_DEG);
  const seen = new Set<number>();
  const out: number[] = [];
  for (let dLat = -cellRadius; dLat <= cellRadius; dLat++) {
    for (let dLng = -cellRadius; dLng <= cellRadius; dLng++) {
      const bucket = index.get(`${latCell + dLat},${lngCell + dLng}`);
      if (!bucket) continue;
      for (const idx of bucket) {
        if (!seen.has(idx)) {
          seen.add(idx);
          out.push(idx);
        }
      }
    }
  }
  return out;
}

function minDistanceForIndices(
  lat: number,
  lng: number,
  polygons: BeatPolygon[],
  indices: number[]
): number {
  let min = Infinity;
  for (const idx of indices) {
    const d = distanceMetersToPolygonBoundary(lat, lng, polygons[idx]);
    if (d < min) min = d;
  }
  return min;
}

/** Shortest distance (metres) from point to nearest beat polygon boundary. */
export function distanceMetersToForestBoundary(
  lat: number,
  lng: number,
  polygons: BeatPolygon[],
  spatialIndex: BeatSpatialIndex
): number {
  if (!polygons.length) return Infinity;

  let min = Infinity;
  for (let radius = 1; radius <= 8 && min === Infinity; radius++) {
    const indices = candidatePolygonIndicesInRadius(lat, lng, spatialIndex, radius);
    if (!indices.length) continue;
    min = minDistanceForIndices(lat, lng, polygons, indices);
  }

  if (min === Infinity) {
    min = minDistanceForIndices(
      lat,
      lng,
      polygons,
      polygons.map((_, idx) => idx)
    );
  }

  return min;
}
