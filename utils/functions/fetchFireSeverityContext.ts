import {
  fetchPointCurrentWeather,
  windDirectionLabel,
} from "@/utils/functions/fetchWeather";

export type FireSeverityLevel = "low" | "moderate" | "high" | "very_high";

export type FireSeverityContext = {
  elevationM: number | null;
  windSpeedKmh: number | null;
  windDirectionDeg: number | null;
  windFromLabel: string;
  /** Compass direction fire is more likely to spread (downwind). */
  spreadTowardLabel: string;
  humidityPercent: number | null;
  temperatureC: number | null;
  severity: FireSeverityLevel;
  severityLabel: string;
  severityHint: string;
};

export type FireSeverityFetchResult =
  | { ok: true; data: FireSeverityContext }
  | { ok: false; message: string };

function spreadTowardFromWind(windFromDeg: number): string {
  return windDirectionLabel((windFromDeg + 180) % 360);
}

function assessSeverity(
  windKmh: number,
  humidityPct: number,
  elevationM: number | null
): Pick<FireSeverityContext, "severity" | "severityLabel" | "severityHint"> {
  let score = 0;

  if (windKmh >= 45) score += 4;
  else if (windKmh >= 30) score += 3;
  else if (windKmh >= 18) score += 2;
  else if (windKmh >= 10) score += 1;

  if (humidityPct < 20) score += 3;
  else if (humidityPct < 35) score += 2;
  else if (humidityPct < 50) score += 1;

  if (elevationM != null && elevationM >= 2000) score += 1;

  if (score >= 6) {
    return {
      severity: "very_high",
      severityLabel: "Very high spread risk",
      severityHint:
        "Strong wind and dry air — fire can spread quickly. Prioritize downwind sectors.",
    };
  }
  if (score >= 4) {
    return {
      severity: "high",
      severityLabel: "High spread risk",
      severityHint:
        "Wind and low humidity favour faster spread. Monitor downwind forest beats.",
    };
  }
  if (score >= 2) {
    return {
      severity: "moderate",
      severityLabel: "Moderate spread risk",
      severityHint:
        "Some weather factors may help the fire grow. Watch wind shifts on satellite view.",
    };
  }
  return {
    severity: "low",
    severityLabel: "Lower spread risk",
    severityHint:
      "Calmer wind or higher humidity may slow spread — still verify on the ground.",
  };
}

async function fetchElevationM(
  latitude: number,
  longitude: number
): Promise<number | null> {
  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
    });
    const res = await fetch(
      `https://api.open-meteo.com/v1/elevation?${params.toString()}`,
      { cache: "no-cache" }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const val = json?.elevation?.[0];
    return typeof val === "number" && Number.isFinite(val) ? Math.round(val) : null;
  } catch {
    return null;
  }
}

/** Elevation + wind at alert coordinates (Open-Meteo, no API key). */
export async function fetchFireSeverityContext(
  latitude: number,
  longitude: number
): Promise<FireSeverityFetchResult> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { ok: false, message: "Invalid coordinates." };
  }

  try {
    const [elevationM, weather] = await Promise.all([
      fetchElevationM(latitude, longitude),
      fetchPointCurrentWeather(latitude, longitude),
    ]);

    if (!weather) {
      return {
        ok: false,
        message: "Could not load wind or weather at this point.",
      };
    }

    const windFromLabel = windDirectionLabel(weather.windDirectionDeg);
    const spreadTowardLabel = spreadTowardFromWind(weather.windDirectionDeg);
    const risk = assessSeverity(
      weather.windSpeedKmh,
      weather.humidityPercent,
      elevationM
    );

    return {
      ok: true,
      data: {
        elevationM,
        windSpeedKmh: Math.round(weather.windSpeedKmh),
        windDirectionDeg: weather.windDirectionDeg,
        windFromLabel,
        spreadTowardLabel,
        humidityPercent: Math.round(weather.humidityPercent),
        temperatureC: Math.round(weather.temperatureC),
        ...risk,
      },
    };
  } catch {
    return {
      ok: false,
      message: "Network error while loading terrain and wind data.",
    };
  }
}

export function severityBadgeColor(level: FireSeverityLevel): string {
  switch (level) {
    case "very_high":
      return "#9d0208";
    case "high":
      return "#c1121f";
    case "moderate":
      return "#f48c06";
    default:
      return "#2d6a4f";
  }
}
