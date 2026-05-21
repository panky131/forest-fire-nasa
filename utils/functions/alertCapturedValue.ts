import { AlertsResponseDataType } from "@/utils/Types";

/** Prefer backend `alertCaptured`; fall back to snake_case or legacy `acq_date`. */
export function alertCapturedValue(
  alert: AlertsResponseDataType & Record<string, unknown>
): unknown {
  if (alert.alertCaptured != null && String(alert.alertCaptured).trim() !== "") {
    return alert.alertCaptured;
  }
  const snake = alert["alert_captured"];
  if (snake != null && String(snake).trim() !== "") {
    return snake;
  }
  if (alert.acq_date != null && String(alert.acq_date).trim() !== "") {
    return alert.acq_date;
  }
  return null;
}
