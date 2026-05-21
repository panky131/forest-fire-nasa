import { AlertsResponseDataType } from "@/utils/Types";

/** Backend marks near-forest beats as `NF`. */
export function beatIsNearForest(beat: string | undefined): boolean {
  return String(beat ?? "").trim() === "NF";
}

/** Alerts shown on the main dashboard (map + stats): exclude near-forest (`NF`) rows. */
export function excludeNearForestAlerts(
  alerts: AlertsResponseDataType[]
): AlertsResponseDataType[] {
  return alerts.filter((a) => !beatIsNearForest(a.beat));
}

/** Near Forest Alerts screen: only rows with near-forest beat. */
export function onlyNearForestAlerts(
  alerts: AlertsResponseDataType[]
): AlertsResponseDataType[] {
  return alerts.filter((a) => beatIsNearForest(a.beat));
}
