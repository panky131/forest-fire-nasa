import { AlertsDurationType, AlertsResponseDataType } from "../Types";

const DURATION_MS: Record<Exclude<AlertsDurationType, "all">, number> = {
  "24hrs": 24 * 60 * 60 * 1000,
  /** Three calendar days (72h), not seven. */
  "3days": 3 * 24 * 60 * 60 * 1000,
};

const rowTimestamp = (datetime: string | undefined | null): number => {
  if (datetime == null || String(datetime).trim() === "") {
    return NaN;
  }
  return new Date(datetime).getTime();
};

const filterByDuration = (
  data: AlertsResponseDataType[],
  duration: AlertsDurationType
): AlertsResponseDataType[] => {
  if (!Array.isArray(data)) {
    return [];
  }

  if (duration === "all") {
    return data;
  }

  const windowMs = DURATION_MS[duration as keyof typeof DURATION_MS];
  if (typeof windowMs !== "number" || Number.isNaN(windowMs) || windowMs <= 0) {
    console.warn("[filterByDuration] Unknown duration, returning copy:", duration);
    return [...data];
  }

  const now = Date.now();

  return data.filter(({ datetime }) => {
    const t = rowTimestamp(datetime);
    if (Number.isNaN(t)) {
      return false;
    }
    return now - t <= windowMs;
  });
};

export { filterByDuration };
