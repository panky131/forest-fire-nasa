import { BEATS_CACHE_VERSION } from "./constants";
import { BeatPolygon, BeatsPolygonsCacheFile } from "./types";
import { yieldToMain } from "./yieldToMain";

let bundledCache: BeatPolygon[] | null = null;

/**
 * Reads polygons shipped in the app bundle (~3 MB JSON).
 * Deferred `require` so startup is not blocked.
 */
export async function loadBundledBeatPolygons(): Promise<BeatPolygon[] | null> {
  if (bundledCache) return bundledCache;
  await yieldToMain();
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const file = require("@/assets/beats/beats_polygons_v1.json") as BeatsPolygonsCacheFile;
    if (file?.version !== BEATS_CACHE_VERSION || !Array.isArray(file.polygons) || !file.polygons.length) {
      return null;
    }
    bundledCache = file.polygons;
    return bundledCache;
  } catch {
    return null;
  }
}
