import { AlertsResponseDataType } from "@/utils/Types";
import {
  NEAR_FOREST_BOUNDARY_METRES,
  NEAR_FOREST_MAX_DISTANCE_M,
  NEAR_FOREST_MID_BAND_HIGH_M,
} from "./constants";
import { distanceMetersToForestBoundary } from "./distanceToForestBoundary";
import { BeatsForestData } from "./beatsKmzService";

export type NearForestDistanceFilter =
  | "all"
  | "lt50"
  | "between50and100"
  | "between100and500";

export function alertLatLng(alert: AlertsResponseDataType): { lat: number; lng: number } | null {
  const lat = parseFloat(String(alert.lat));
  const lng = parseFloat(String(alert.lng));
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  return { lat, lng };
}

export function buildNearForestDistanceMap(
  alerts: AlertsResponseDataType[],
  forest: BeatsForestData
): Map<number, number> {
  const map = new Map<number, number>();
  for (const alert of alerts) {
    const coords = alertLatLng(alert);
    if (!coords) continue;
    const metres = distanceMetersToForestBoundary(
      coords.lat,
      coords.lng,
      forest.polygons,
      forest.spatialIndex
    );
    if (Number.isFinite(metres) && metres !== Infinity) {
      map.set(alert.alert_id, metres);
    }
  }
  return map;
}

/** When boundaries are loaded, keep only NF rows with a known distance ≤ max. */
export function nearForestAlertsWithinMaxDistance(
  alerts: AlertsResponseDataType[],
  distanceByAlertId: Map<number, number>,
  boundariesReady: boolean
): AlertsResponseDataType[] {
  if (!boundariesReady) return alerts;
  return alerts.filter((a) => {
    const d = distanceByAlertId.get(a.alert_id);
    return d !== undefined && d <= NEAR_FOREST_MAX_DISTANCE_M;
  });
}

export function filterNearForestByBoundaryDistance(
  alerts: AlertsResponseDataType[],
  filter: NearForestDistanceFilter,
  distanceByAlertId: Map<number, number>
): AlertsResponseDataType[] {
  if (filter === "all") return alerts;

  return alerts.filter((alert) => {
    const metres = distanceByAlertId.get(alert.alert_id);
    if (metres === undefined) return false;
    if (filter === "between50and100") {
      return (
        metres >= NEAR_FOREST_BOUNDARY_METRES && metres <= NEAR_FOREST_MID_BAND_HIGH_M
      );
    }
    if (filter === "between100and500") {
      return metres > NEAR_FOREST_MID_BAND_HIGH_M && metres <= NEAR_FOREST_MAX_DISTANCE_M;
    }
    return metres < NEAR_FOREST_BOUNDARY_METRES;
  });
}

export function nearForestDistanceBucketCounts(
  alerts: AlertsResponseDataType[],
  distanceByAlertId: Map<number, number>
): {
  between50and100: number;
  between100and500: number;
  lt50: number;
  unknown: number;
} {
  let between50and100 = 0;
  let between100and500 = 0;
  let lt50 = 0;
  let unknown = 0;
  for (const alert of alerts) {
    const metres = distanceByAlertId.get(alert.alert_id);
    if (metres === undefined) {
      unknown += 1;
      continue;
    }
    if (metres < NEAR_FOREST_BOUNDARY_METRES) lt50 += 1;
    else if (metres <= NEAR_FOREST_MID_BAND_HIGH_M) between50and100 += 1;
    else if (metres <= NEAR_FOREST_MAX_DISTANCE_M) between100and500 += 1;
  }
  return { between50and100, between100and500, lt50, unknown };
}
