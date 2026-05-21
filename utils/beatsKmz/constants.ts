/** Uttarakhand forest beat boundaries (KMZ on server). */
export const BEATS_KMZ_URL =
  "https://www.programmingyan.com/forest_fire/map/kmz/beats_uk.kmz";

/**
 * Compact pre-built polygons (~3 MB). Prefer this over KMZ on device.
 * Generate with: `node scripts/build-beats-polygons.mjs`
 * Upload the output file to this URL (or ship via `assets/beats/`).
 */
export const BEATS_POLYGONS_JSON_URL =
  "https://www.programmingyan.com/forest_fire/map/kmz/beats_uk_polygons_v1.json";

export const BEATS_CACHE_VERSION = 2;

export const BEATS_CACHE_DIR_NAME = "beats_cache";
export const BEATS_KMZ_FILE = "beats_uk.kmz";
export const BEATS_POLYGONS_FILE = "beats_polygons_v2.json";

/** Vertices per beat ring — enough for ~50 m distance checks, keeps JSON small. */
export const BEATS_POLYGON_MAX_POINTS = 25;

/** Placemarks processed per chunk before yielding (KMZ fallback only). */
export const BEATS_KML_PARSE_BATCH = 35;

/** Lower bucket: distance from forest boundary &lt; this (metres). */
export const NEAR_FOREST_BOUNDARY_METRES = 50;

/** Upper edge of the “50 m to 100 m” band (metres, inclusive). */
export const NEAR_FOREST_MID_BAND_HIGH_M = 100;

/** Near Forest screen: show alerts with distance to boundary ≤ this (metres). */
export const NEAR_FOREST_MAX_DISTANCE_M = 500;
