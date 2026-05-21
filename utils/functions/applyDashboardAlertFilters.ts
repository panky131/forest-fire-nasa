import { AlertsDurationType, AlertsResponseDataType } from "@/utils/Types";
import { filterByDuration } from "@/utils/functions/filterAlertsByDuration";
import {
  beatIsNearForest,
  excludeNearForestAlerts,
  onlyNearForestAlerts,
} from "@/utils/functions/nearForestBeat";

/** Main dashboard: all non-NF vs active + being held only. */
export type DashboardFireScope = "all" | "operational";

export type DashboardAlertSlice = "main" | "nearForest";

export function applyDashboardAlertFilters(args: {
  alertsData: AlertsResponseDataType[];
  alertsDuration: AlertsDurationType;
  slice: DashboardAlertSlice;
  fireScope: DashboardFireScope;
}): AlertsResponseDataType[] {
  const { alertsData, alertsDuration, slice, fireScope } = args;

  let list =
    alertsDuration === "all"
      ? [...alertsData]
      : filterByDuration(alertsData, alertsDuration);

  if (slice === "nearForest") {
    list = onlyNearForestAlerts(list);
    return list;
  }

  list = excludeNearForestAlerts(list);

  if (fireScope === "operational") {
    list = list.filter(
      (a) => a.status === "active" || a.status === "being_held"
    );
  }

  return list;
}

export function countOperationalFireAlerts(
  alerts: AlertsResponseDataType[]
): number {
  return excludeNearForestAlerts(alerts).filter(
    (a) => a.status === "active" || a.status === "being_held"
  ).length;
}

export { beatIsNearForest };
