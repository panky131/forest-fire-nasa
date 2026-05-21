import { InteractionManager } from "react-native";
import * as FileSystem from "expo-file-system/legacy";
import { strFromU8, unzipSync } from "fflate";

import {
  BEATS_CACHE_DIR_NAME,
  BEATS_CACHE_VERSION,
  BEATS_KMZ_FILE,
  BEATS_KMZ_URL,
  BEATS_POLYGONS_FILE,
  BEATS_POLYGONS_JSON_URL,
} from "./constants";
import { loadBundledBeatPolygons } from "./loadBundledPolygons";
import { buildBeatSpatialIndex, BeatSpatialIndex } from "./distanceToForestBoundary";
import { parseKmlBeatPolygonsAsync } from "./parseKmlBeats";
import { BeatPolygon, BeatsPolygonsCacheFile } from "./types";
import { yieldToMain } from "./yieldToMain";

export type BeatsForestData = {
  polygons: BeatPolygon[];
  spatialIndex: BeatSpatialIndex;
};

type LoadState = "idle" | "loading" | "ready" | "error";

let loadPromise: Promise<BeatsForestData | null> | null = null;
let loadScheduled = false;
let cachedData: BeatsForestData | null = null;
let loadState: LoadState = "idle";
let loadError: string | null = null;

function cacheDir(): string {
  return `${FileSystem.documentDirectory}${BEATS_CACHE_DIR_NAME}/`;
}

function kmzPath(): string {
  return `${cacheDir()}${BEATS_KMZ_FILE}`;
}

function polygonsJsonPath(): string {
  return `${cacheDir()}${BEATS_POLYGONS_FILE}`;
}

async function ensureCacheDir(): Promise<void> {
  const dir = cacheDir();
  const info = await FileSystem.getInfoAsync(dir);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
}

async function readPolygonsFromDiskCache(): Promise<BeatPolygon[] | null> {
  const path = polygonsJsonPath();
  const info = await FileSystem.getInfoAsync(path);
  if (!info.exists) return null;
  try {
    await yieldToMain();
    const raw = await FileSystem.readAsStringAsync(path);
    await yieldToMain();
    const parsed = JSON.parse(raw) as BeatsPolygonsCacheFile;
    if (parsed?.version !== BEATS_CACHE_VERSION || !Array.isArray(parsed.polygons)) {
      return null;
    }
    return parsed.polygons;
  } catch {
    return null;
  }
}

async function writePolygonsDiskCache(polygons: BeatPolygon[]): Promise<void> {
  await ensureCacheDir();
  const payload: BeatsPolygonsCacheFile = {
    version: BEATS_CACHE_VERSION,
    polygons,
  };
  await FileSystem.writeAsStringAsync(polygonsJsonPath(), JSON.stringify(payload));
}

async function downloadPolygonsJson(): Promise<BeatPolygon[] | null> {
  await ensureCacheDir();
  const path = polygonsJsonPath();
  try {
    const result = await FileSystem.downloadAsync(BEATS_POLYGONS_JSON_URL, path);
    if (result.status !== 200) return null;
    return readPolygonsFromDiskCache();
  } catch {
    return null;
  }
}

async function downloadKmzIfNeeded(): Promise<void> {
  await ensureCacheDir();
  const path = kmzPath();
  const info = await FileSystem.getInfoAsync(path);
  if (info.exists) return;

  const result = await FileSystem.downloadAsync(BEATS_KMZ_URL, path);
  if (result.status !== 200) {
    throw new Error(`Beats KMZ download failed (${result.status})`);
  }
}

async function readKmzBytes(): Promise<Uint8Array> {
  const uri = kmzPath();
  const response = await fetch(uri);
  if (!response.ok) {
    throw new Error(`Could not read KMZ (${response.status})`);
  }
  return new Uint8Array(await response.arrayBuffer());
}

/** Last resort: download + unzip + chunked parse (slow; avoid when possible). */
async function parseKmzFromDiskAsync(): Promise<BeatPolygon[]> {
  await yieldToMain();
  const zipped = await readKmzBytes();
  await yieldToMain();
  const files = unzipSync(zipped);
  const kmlBytes = files["doc.kml"];
  if (!kmlBytes) {
    throw new Error("beats_uk.kmz: doc.kml not found");
  }
  const kml = strFromU8(kmlBytes);
  await yieldToMain();
  return parseKmlBeatPolygonsAsync(kml);
}

async function wrapPolygonsAsync(polygons: BeatPolygon[]): Promise<BeatsForestData> {
  await yieldToMain();
  return {
    polygons,
    spatialIndex: buildBeatSpatialIndex(polygons),
  };
}

/** Remove 48 MB KMZ once compact polygons are available. */
async function dropKmzIfPresent(): Promise<void> {
  try {
    const info = await FileSystem.getInfoAsync(kmzPath());
    if (info.exists) {
      await FileSystem.deleteAsync(kmzPath(), { idempotent: true });
    }
  } catch {
    /* ignore */
  }
}

async function resolvePolygons(): Promise<BeatPolygon[]> {
  const bundled = await loadBundledBeatPolygons();
  if (bundled?.length) {
    await dropKmzIfPresent();
    return bundled;
  }

  const disk = await readPolygonsFromDiskCache();
  if (disk?.length) {
    await dropKmzIfPresent();
    return disk;
  }

  const remoteJson = await downloadPolygonsJson();
  if (remoteJson?.length) {
    await dropKmzIfPresent();
    return remoteJson;
  }

  await downloadKmzIfNeeded();
  const fromKmz = await parseKmzFromDiskAsync();
  if (fromKmz.length > 0) {
    await writePolygonsDiskCache(fromKmz);
    await dropKmzIfPresent();
  }
  return fromKmz;
}

/**
 * Schedule load after navigation / animations — avoids hanging dashboard open.
 */
export function scheduleBeatsForestDataLoad(): void {
  if (cachedData || loadPromise || loadScheduled) return;
  loadScheduled = true;
  InteractionManager.runAfterInteractions(() => {
    setTimeout(() => {
      loadScheduled = false;
      void ensureBeatsForestDataLoaded();
    }, 500);
  });
}

/**
 * Load beat boundaries once per session. Never throws — maps/alerts work without overlay.
 */
export async function ensureBeatsForestDataLoaded(): Promise<BeatsForestData | null> {
  if (cachedData) return cachedData;
  if (loadPromise) return loadPromise;

  loadPromise = (async () => {
    loadState = "loading";
    loadError = null;
    try {
      const polygons = await resolvePolygons();
      if (!polygons?.length) {
        throw new Error("No beat polygons available");
      }
      cachedData = await wrapPolygonsAsync(polygons);
      loadState = "ready";
      return cachedData;
    } catch (e) {
      loadState = "error";
      loadError = e instanceof Error ? e.message : "Failed to load beat boundaries";
      console.warn("[beatsKmz]", loadError);
      return null;
    } finally {
      loadPromise = null;
    }
  })();

  return loadPromise;
}

export function getBeatsForestDataSync(): BeatsForestData | null {
  return cachedData;
}

export function getBeatsLoadState(): { state: LoadState; error: string | null } {
  return { state: loadState, error: loadError };
}

/**
 * All beat polygons visible in the current map region.
 * No arbitrary cap — otherwise most beats never draw when zoomed out.
 */
export function beatPolygonsInRegion(
  polygons: BeatPolygon[],
  region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }
): BeatPolygon[] {
  const minLat = region.latitude - region.latitudeDelta / 2;
  const maxLat = region.latitude + region.latitudeDelta / 2;
  const minLng = region.longitude - region.longitudeDelta / 2;
  const maxLng = region.longitude + region.longitudeDelta / 2;

  const hits: BeatPolygon[] = [];
  for (const poly of polygons) {
    const [pMinLng, pMinLat, pMaxLng, pMaxLat] = poly.bbox;
    if (pMaxLng < minLng || pMinLng > maxLng || pMaxLat < minLat || pMinLat > maxLat) {
      continue;
    }
    hits.push(poly);
  }
  return hits;
}

/** True when the user is zoomed out enough to show every beat in view. */
export function isWideForestMapView(region: {
  latitudeDelta: number;
  longitudeDelta: number;
}): boolean {
  return region.latitudeDelta >= 0.35 || region.longitudeDelta >= 0.35;
}
