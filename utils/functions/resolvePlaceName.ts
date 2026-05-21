import * as Location from "expo-location";

const NOMINATIM_UA = "ForestFireUttarakhand/1.0 (react-native-weather)";

function norm(s: string | undefined | null): string {
  return s != null ? String(s).trim() : "";
}

function isLikelyStreetOnly(name: string): boolean {
  return /^\d+[\s,-]/.test(name) || /^(unnamed|road|street)/i.test(name);
}

/** Prefer locality + district; avoid wrong distant `city` (e.g. Rishikesh vs Dehradun). */
function pickShortPlaceFromExpo(a: Location.LocationGeocodedAddress): string | null {
  const name = norm(a.name);
  const district = norm(a.district);
  const subregion = norm(a.subregion);
  const city = norm(a.city);
  const region = norm(a.region);

  const locality =
    name && !isLikelyStreetOnly(name) ? name : "";

  const admin =
    district ||
    (subregion && subregion.toLowerCase() !== city.toLowerCase() ? subregion : "") ||
    city;

  if (locality && admin && locality.toLowerCase() !== admin.toLowerCase()) {
    return `${locality}, ${admin}`;
  }
  if (locality) {
    return region && !locality.toLowerCase().includes(region.toLowerCase())
      ? `${locality}, ${region}`
      : locality;
  }
  if (admin) {
    return region && admin.toLowerCase() !== region.toLowerCase()
      ? `${admin}, ${region}`
      : admin;
  }
  return region || city || null;
}

type NominatimAddress = Record<string, string | undefined>;

export type AlertLocationLabel = {
  /** Village / hamlet / locality from map data. */
  village: string | null;
  /** Tehsil, district, or state when available. */
  area: string | null;
  coordinates: string;
};

function pickVillageFromNominatim(addr: NominatimAddress): {
  village: string | null;
  area: string | null;
} {
  const village = norm(
    addr.village ||
      addr.hamlet ||
      addr.locality ||
      addr.neighbourhood ||
      addr.suburb ||
      addr.quarter
  );
  const area = norm(
    addr.county ||
      addr.state_district ||
      addr.city_district ||
      addr.municipality ||
      addr.city ||
      addr.state
  );

  if (village && area && village.toLowerCase() === area.toLowerCase()) {
    return { village, area: norm(addr.state) || null };
  }
  return { village: village || null, area: area || null };
}

function pickVillageFromExpo(a: Location.LocationGeocodedAddress): {
  village: string | null;
  area: string | null;
} {
  const village = norm(
    a.name && !isLikelyStreetOnly(a.name) ? a.name : ""
  ) || norm(a.subregion);
  const area = norm(a.district || a.city || a.region);
  return { village: village || null, area: area || null };
}

async function fetchNominatimAddress(
  latitude: number,
  longitude: number,
  zoom: string
): Promise<NominatimAddress | null> {
  try {
    const params = new URLSearchParams({
      format: "json",
      lat: String(latitude),
      lon: String(longitude),
      zoom,
      addressdetails: "1",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      { headers: { "User-Agent": NOMINATIM_UA } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address;
    if (!addr || typeof addr !== "object") return null;
    return addr as NominatimAddress;
  } catch {
    return null;
  }
}

const alertLocationCache = new Map<string, AlertLocationLabel>();

/** Village / locality at alert coordinates (satellite map / OpenStreetMap). */
export async function resolveAlertLocationLabel(
  latitude: number,
  longitude: number
): Promise<AlertLocationLabel> {
  const coordinates = `${latitude.toFixed(4)}°, ${longitude.toFixed(4)}°`;
  const cacheKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
  const cached = alertLocationCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const addr =
    (await fetchNominatimAddress(latitude, longitude, "18")) ??
    (await fetchNominatimAddress(latitude, longitude, "16"));

  if (addr) {
    const { village, area } = pickVillageFromNominatim(addr);
    if (village || area) {
      const result = { village, area, coordinates };
      alertLocationCache.set(cacheKey, result);
      return result;
    }
  }

  try {
    const results = await Location.reverseGeocodeAsync({ latitude, longitude });
    if (results?.length) {
      const { village, area } = pickVillageFromExpo(results[0]);
      if (village || area) {
        const result = { village, area, coordinates };
        alertLocationCache.set(cacheKey, result);
        return result;
      }
    }
  } catch {
    /* ignore */
  }

  const fallback = await resolveShortPlaceNameFromCoords(latitude, longitude);
  const result = {
    village: fallback,
    area: null,
    coordinates,
  };
  alertLocationCache.set(cacheKey, result);
  return result;
}

function pickShortPlaceFromNominatim(addr: NominatimAddress): string | null {
  const locality = norm(
    addr.village ||
      addr.suburb ||
      addr.neighbourhood ||
      addr.hamlet ||
      addr.quarter ||
      addr.town
  );
  const admin = norm(
    addr.city_district || addr.county || addr.municipality || addr.city
  );
  const state = norm(addr.state);

  if (locality && admin && locality.toLowerCase() !== admin.toLowerCase()) {
    return `${locality}, ${admin}`;
  }
  if (locality) {
    return state && !locality.toLowerCase().includes(state.toLowerCase())
      ? `${locality}, ${state}`
      : locality;
  }
  if (admin) {
    return state && admin.toLowerCase() !== state.toLowerCase()
      ? `${admin}, ${state}`
      : admin;
  }
  return state || null;
}

async function fetchNominatimShortName(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    const params = new URLSearchParams({
      format: "json",
      lat: String(latitude),
      lon: String(longitude),
      zoom: "16",
      addressdetails: "1",
    });
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?${params.toString()}`,
      {
        headers: { "User-Agent": NOMINATIM_UA },
      }
    );
    if (!res.ok) return null;
    const data = await res.json();
    const addr = data?.address;
    if (!addr || typeof addr !== "object") return null;
    return pickShortPlaceFromNominatim(addr as NominatimAddress);
  } catch {
    return null;
  }
}

/** Trim long labels (e.g. division name from login). */
export function shortenDisplayLabel(text: string, maxLen = 36): string {
  const t = text.trim();
  if (t.length <= maxLen) return t;
  return `${t.slice(0, maxLen - 1).trim()}…`;
}

/**
 * Short place label: OpenStreetMap first (better locality), then device geocoder.
 */
export async function resolveShortPlaceNameFromCoords(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const fromOsm = await fetchNominatimShortName(latitude, longitude);
  if (fromOsm) return fromOsm;

  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (!results?.length) return null;
    return pickShortPlaceFromExpo(results[0]);
  } catch {
    return null;
  }
}

/** Full place name (city, district, state, …). */
export async function resolvePlaceNameFromCoords(
  latitude: number,
  longitude: number
): Promise<string | null> {
  const short = await resolveShortPlaceNameFromCoords(latitude, longitude);
  if (short) return short;

  try {
    const results = await Location.reverseGeocodeAsync({
      latitude,
      longitude,
    });
    if (!results?.length) return null;

    const a = results[0];
    const candidates = [a.name, a.district, a.subregion, a.city, a.region, a.country]
      .map((p) => norm(p))
      .filter(Boolean);

    const seen = new Set<string>();
    const parts: string[] = [];
    for (const part of candidates) {
      const key = part.toLowerCase();
      if (!seen.has(key)) {
        seen.add(key);
        parts.push(part);
      }
    }

    return parts.length ? parts.join(", ") : null;
  } catch {
    return null;
  }
}

export type WeatherCoordsSource = "device" | "login";

export type WeatherCoordsResult = {
  lat: number;
  lon: number;
  source: WeatherCoordsSource;
  loginDivisionLabel: string;
};

/**
 * Weather: prefer phone GPS (where you are now), else coordinates saved at login.
 */
export async function resolveWeatherCoordinates(
  loginLat: number,
  loginLon: number,
  loginDivisionLabel: string
): Promise<WeatherCoordsResult> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status === "granted") {
      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      if (
        Number.isFinite(pos.coords.latitude) &&
        Number.isFinite(pos.coords.longitude)
      ) {
        return {
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          source: "device",
          loginDivisionLabel,
        };
      }
    }
  } catch {
    /* fall through to login */
  }

  return {
    lat: loginLat,
    lon: loginLon,
    source: "login",
    loginDivisionLabel,
  };
}
