import * as SecureStore from "expo-secure-store";
import { Dispatch, SetStateAction } from "react";

import URLs from "../URLs";
import { AlertsDurationType, AlertsResponseDataType } from "../Types";

/** Result of calling the alerts API (`get_alerts_ref.php`). */
export type AlertsFetchResult = {
  ok: boolean;
  alerts: AlertsResponseDataType[];
  /** Message safe to show in the UI (from API or a short fallback). */
  userMessage: string | null;
  httpStatus: number | null;
  /** `status` field from JSON when present (`success` | `error` | …). */
  apiStatus: string | null;
  /** First chunk of raw response body for debugging unexpected payloads. */
  responsePreview: string | null;
};

type GetAlertsArgs = {
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  alertsDuration: AlertsDurationType;
};

const getAuthKey = async (): Promise<string | null> => {
  return SecureStore.getItemAsync("auth_key");
};

const createFormData = (
  authKey: string,
  alertsDuration: AlertsDurationType
): FormData => {
  const formData = new FormData();
  /** Same value as DB `user_auth.token` — PHP reads `$_POST['unique_id']`. */
  formData.append("unique_id", authKey);
  /** Some deployments read duration from POST instead of (or in addition to) the query string. */
  formData.append("duration", alertsDuration);
  return formData;
};

const fetchAlerts = async (
  formData: FormData,
  alertsDuration: AlertsDurationType
): Promise<Response> => {
  const random = Math.floor(Math.random() * 9999);
  const url =
    URLs.api_base_url +
    `get_alerts_ref.php?random=${random}&duration=${alertsDuration}`;

  return fetch(url, {
    method: "POST",
    body: formData,
    cache: "no-cache",
  });
};

function readApiMessage(payload: Record<string, unknown> | null): string | null {
  if (!payload) return null;
  const m = payload.msg ?? payload.message ?? payload.error;
  if (typeof m === "string" && m.trim()) return m.trim();
  return null;
}

const PREVIEW_LEN = 900;

function previewBody(raw: string): string {
  const t = raw.replace(/\s+/g, " ").trim();
  if (t.length <= PREVIEW_LEN) return t;
  return `${t.slice(0, PREVIEW_LEN)}…`;
}

function normalizeApiStatus(parsed: Record<string, unknown> | null): string | null {
  if (!parsed || !("status" in parsed)) return null;
  const s = parsed.status;
  if (s === undefined || s === null) return null;
  return String(s).trim();
}

function normalizeAlerts(raw: unknown): AlertsResponseDataType[] {
  if (!raw || typeof raw !== "object") return [];
  const o = raw as { alerts?: unknown };
  return Array.isArray(o.alerts) ? (o.alerts as AlertsResponseDataType[]) : [];
}

/**
 * Loads alerts from `get_alerts_ref.php`.
 * Parses JSON for both HTTP 200 and error responses (including some 500 bodies that are still JSON).
 */
const getAlertsData = async (args: GetAlertsArgs): Promise<AlertsFetchResult> => {
  const { setIsLoading, alertsDuration } = args;

  const fail = (
    userMessage: string,
    httpStatus: number | null,
    apiStatus: string | null,
    raw: string
  ): AlertsFetchResult => ({
    ok: false,
    alerts: [],
    userMessage,
    httpStatus,
    apiStatus,
    responsePreview: previewBody(raw),
  });

  try {
    setIsLoading(true);

    const authKey = await getAuthKey();
    if (!authKey || !authKey.trim()) {
      return fail("Not signed in (missing session). Please log in again.", null, "error", "");
    }

    const trimmed = authKey.trim();
    const formData = createFormData(trimmed, alertsDuration);
    console.log(
      `[getAlerts] POST multipart: unique_id length=${trimmed.length}, duration=${alertsDuration}`
    );
    const response = await fetchAlerts(formData, alertsDuration);
    const httpStatus = response.status;
    const raw = await response.text();

    console.log(
      `[getAlerts] URL ${URLs.api_base_url}get_alerts_ref.php · HTTP ${httpStatus} · body length ${raw.length}`
    );
    console.log("[getAlerts] Raw response body:\n", raw);

    let parsed: Record<string, unknown> | null = null;
    try {
      const tmp: unknown = JSON.parse(raw);
      if (Array.isArray(tmp)) {
        return fail(
          "Server returned a JSON array at the root (expected an object with status and alerts).",
          httpStatus,
          null,
          raw
        );
      }
      if (tmp !== null && typeof tmp === "object") {
        parsed = tmp as Record<string, unknown>;
      }
    } catch {
      parsed = null;
    }

    const apiStatus = normalizeApiStatus(parsed);
    const apiStatusLower = apiStatus?.toLowerCase() ?? null;
    const apiMsg = readApiMessage(parsed);
    const apiBuild =
      parsed && typeof parsed.apiBuild === "string" ? parsed.apiBuild.trim() : null;
    if (apiBuild) {
      console.log(`[getAlerts] server apiBuild: ${apiBuild}`);
    }

    if (parsed && apiStatusLower === "success") {
      const alerts = normalizeAlerts(parsed);
      if (alerts.length > 0) {
        const sample = alerts[0] as AlertsResponseDataType & Record<string, unknown>;
        console.log(
          `[getAlerts] sample keys: ${Object.keys(sample).join(", ")}`
        );
        console.log(
          `[getAlerts] alertCaptured=${String(sample.alertCaptured ?? "(missing)")} acq_date=${String(sample.acq_date ?? "(missing)")}`
        );
      }
      console.log(
        `[getAlerts] OK HTTP ${httpStatus} apiStatus=success count=${alerts.length}`
      );
      return {
        ok: true,
        alerts,
        userMessage: apiMsg,
        httpStatus,
        apiStatus,
        responsePreview: null,
      };
    }

    if (parsed && apiStatusLower === "error") {
      console.warn(
        `[getAlerts] API error HTTP ${httpStatus}:`,
        apiMsg ?? "(no msg)"
      );
      return fail(
        apiMsg ?? "Alerts could not be loaded (server reported an error).",
        httpStatus,
        apiStatus,
        raw
      );
    }

    if (!response.ok) {
      console.error(
        `[getAlerts] HTTP ${httpStatus} — first 400 chars of body:\n`,
        raw.slice(0, 400)
      );
      return fail(
        apiMsg ??
          `Server error (HTTP ${httpStatus}). Alerts could not be loaded.`,
        httpStatus,
        apiStatus,
        raw
      );
    }

    const keys = parsed ? Object.keys(parsed).join(", ") : "(not JSON)";
    console.warn("[getAlerts] Unexpected JSON — top-level keys:", keys);
    return fail(
      `${apiMsg ?? "Unexpected response from alerts API."}\n\nKeys: ${keys}`,
      httpStatus,
      apiStatus,
      raw
    );
  } catch (error) {
    console.error("[getAlerts] Network / request failure:", error);
    return fail("Network error while loading alerts.", null, null, "");
  } finally {
    setIsLoading(false);
  }
};

export { getAlertsData };
