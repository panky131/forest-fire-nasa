import { BEATS_KML_PARSE_BATCH, BEATS_POLYGON_MAX_POINTS } from "./constants";
import { BeatPolygon, LatLng } from "./types";
import { yieldToMain } from "./yieldToMain";

const PLACEMARK_RE = /<Placemark[\s\S]*?<\/Placemark>/gi;
const COORDINATES_RE = /<coordinates>([\s\S]*?)<\/coordinates>/gi;

function parseCoordinateString(raw: string): LatLng[] {
  const points: LatLng[] = [];
  const tokens = raw.trim().split(/\s+/);
  for (const token of tokens) {
    const parts = token.split(",").map((p) => p.trim());
    if (parts.length < 2) continue;
    const lng = parseFloat(parts[0]);
    const lat = parseFloat(parts[1]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      points.push({ latitude: lat, longitude: lng });
    }
  }
  return points;
}

function computeBbox(ring: LatLng[]): BeatPolygon["bbox"] {
  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;
  for (const p of ring) {
    if (p.longitude < minLng) minLng = p.longitude;
    if (p.latitude < minLat) minLat = p.latitude;
    if (p.longitude > maxLng) maxLng = p.longitude;
    if (p.latitude > maxLat) maxLat = p.latitude;
  }
  return [minLng, minLat, maxLng, maxLat];
}

/** Reduce vertex count so map + distance checks stay responsive. */
export function simplifyRing(ring: LatLng[], maxPoints: number): LatLng[] {
  if (ring.length <= maxPoints) return ring;
  const step = Math.ceil(ring.length / maxPoints);
  const out: LatLng[] = [];
  for (let i = 0; i < ring.length; i += step) {
    out.push(ring[i]);
  }
  const last = ring[ring.length - 1];
  const tail = out[out.length - 1];
  if (tail.latitude !== last.latitude || tail.longitude !== last.longitude) {
    out.push(last);
  }
  return out;
}

/** First outer ring only (one beat boundary per placemark). */
function outerRingFromPlacemarkBlock(block: string): LatLng[] | null {
  COORDINATES_RE.lastIndex = 0;
  const match = COORDINATES_RE.exec(block);
  if (!match) return null;
  const ring = parseCoordinateString(match[1]);
  return ring.length >= 3 ? ring : null;
}

/** Parse beat polygons from KML text (sync — prefer JSON / async parser). */
export function parseKmlBeatPolygons(
  kml: string,
  maxPointsPerRing = BEATS_POLYGON_MAX_POINTS
): BeatPolygon[] {
  const polygons: BeatPolygon[] = [];
  let id = 0;
  let placemark: RegExpExecArray | null;
  PLACEMARK_RE.lastIndex = 0;
  while ((placemark = PLACEMARK_RE.exec(kml)) !== null) {
    const ring = outerRingFromPlacemarkBlock(placemark[0]);
    if (!ring) continue;
    const simplified = simplifyRing(ring, maxPointsPerRing);
    if (simplified.length < 3) continue;
    polygons.push({
      id: id++,
      bbox: computeBbox(simplified),
      ring: simplified,
    });
  }
  return polygons;
}

/** Chunked KML parse so the UI thread can breathe (KMZ fallback only). */
export async function parseKmlBeatPolygonsAsync(
  kml: string,
  maxPointsPerRing = BEATS_POLYGON_MAX_POINTS
): Promise<BeatPolygon[]> {
  const polygons: BeatPolygon[] = [];
  let id = 0;
  let placemark: RegExpExecArray | null;
  let batch = 0;
  PLACEMARK_RE.lastIndex = 0;
  while ((placemark = PLACEMARK_RE.exec(kml)) !== null) {
    const ring = outerRingFromPlacemarkBlock(placemark[0]);
    if (ring) {
      const simplified = simplifyRing(ring, maxPointsPerRing);
      if (simplified.length >= 3) {
        polygons.push({
          id: id++,
          bbox: computeBbox(simplified),
          ring: simplified,
        });
      }
    }
    batch += 1;
    if (batch >= BEATS_KML_PARSE_BATCH) {
      batch = 0;
      await yieldToMain();
    }
  }
  return polygons;
}
