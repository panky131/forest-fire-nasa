/** Free forecast API — no API key. https://open-meteo.com/ */

export type WeatherCurrent = {
  time: string;
  temperatureC: number;
  apparentTemperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
  precipitationMm: number;
  weatherCode: number;
  description: string;
};

export type WeatherDaily = {
  date: string;
  weatherCode: number;
  description: string;
  tempMaxC: number;
  tempMinC: number;
  precipitationMm: number;
  windMaxKmh: number;
};

export type WeatherForecast = {
  timezone: string;
  current: WeatherCurrent;
  daily: WeatherDaily[];
};

export type WeatherFetchResult =
  | { ok: true; data: WeatherForecast }
  | { ok: false; message: string };

export type PointCurrentWeather = {
  temperatureC: number;
  humidityPercent: number;
  windSpeedKmh: number;
  windDirectionDeg: number;
};

const pointWeatherCache = new Map<
  string,
  { fetchedAt: number; data: PointCurrentWeather }
>();
const POINT_WEATHER_CACHE_MS = 15 * 60 * 1000;

function pointWeatherCacheKey(latitude: number, longitude: number): string {
  return `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
}

/** Current conditions at a point (cached ~15 min). Used by alert callout & severity block. */
export async function fetchPointCurrentWeather(
  latitude: number,
  longitude: number
): Promise<PointCurrentWeather | null> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return null;
  }

  const key = pointWeatherCacheKey(latitude, longitude);
  const cached = pointWeatherCache.get(key);
  if (cached && Date.now() - cached.fetchedAt < POINT_WEATHER_CACHE_MS) {
    return cached.data;
  }

  try {
    const params = new URLSearchParams({
      latitude: String(latitude),
      longitude: String(longitude),
      current: "wind_speed_10m,wind_direction_10m,relative_humidity_2m,temperature_2m",
    });
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
      { cache: "no-cache" }
    );
    if (!res.ok) return null;
    const cur = (await res.json())?.current;
    if (!cur) return null;

    const data: PointCurrentWeather = {
      temperatureC: Number(cur.temperature_2m ?? 0),
      humidityPercent: Number(cur.relative_humidity_2m ?? 0),
      windSpeedKmh: Number(cur.wind_speed_10m ?? 0),
      windDirectionDeg: Number(cur.wind_direction_10m ?? 0),
    };
    pointWeatherCache.set(key, { fetchedAt: Date.now(), data });
    return data;
  } catch {
    return null;
  }
}

export async function fetchCurrentTemperatureAtPoint(
  latitude: number,
  longitude: number
): Promise<{ ok: true; temperatureC: number } | { ok: false; message: string }> {
  const weather = await fetchPointCurrentWeather(latitude, longitude);
  if (!weather) {
    return { ok: false, message: "Could not load temperature for this location." };
  }
  return { ok: true, temperatureC: Math.round(weather.temperatureC) };
}

/** WMO weather interpretation codes (Open-Meteo). */
export function weatherCodeDescription(code: number): string {
  if (code === 0) return "Clear sky";
  if (code === 1) return "Mainly clear";
  if (code === 2) return "Partly cloudy";
  if (code === 3) return "Overcast";
  if (code === 45 || code === 48) return "Fog";
  if (code === 51 || code === 53 || code === 55) return "Drizzle";
  if (code === 56 || code === 57) return "Freezing drizzle";
  if (code === 61 || code === 63 || code === 65) return "Rain";
  if (code === 66 || code === 67) return "Freezing rain";
  if (code === 71 || code === 73 || code === 75) return "Snow";
  if (code === 77) return "Snow grains";
  if (code === 80 || code === 81 || code === 82) return "Rain showers";
  if (code === 85 || code === 86) return "Snow showers";
  if (code === 95) return "Thunderstorm";
  if (code === 96 || code === 99) return "Thunderstorm with hail";
  return "Unknown";
}

function windDirectionLabel(deg: number): string {
  const dirs = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const i = Math.round(deg / 45) % 8;
  return dirs[i];
}

export async function fetchWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherFetchResult> {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    timezone: "auto",
    forecast_days: "7",
    current: [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "precipitation",
      "weather_code",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
    daily: [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "precipitation_sum",
      "wind_speed_10m_max",
    ].join(","),
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-cache" });
    if (!res.ok) {
      return { ok: false, message: `Weather service error (HTTP ${res.status}).` };
    }

    const json = await res.json();
    const cur = json?.current;
    const daily = json?.daily;

    if (!cur || !daily?.time?.length) {
      return { ok: false, message: "Weather data was not available for this location." };
    }

    const code = Number(cur.weather_code ?? 0);
    const current: WeatherCurrent = {
      time: String(cur.time ?? ""),
      temperatureC: Number(cur.temperature_2m ?? 0),
      apparentTemperatureC: Number(cur.apparent_temperature ?? cur.temperature_2m ?? 0),
      humidityPercent: Number(cur.relative_humidity_2m ?? 0),
      windSpeedKmh: Number(cur.wind_speed_10m ?? 0),
      windDirectionDeg: Number(cur.wind_direction_10m ?? 0),
      precipitationMm: Number(cur.precipitation ?? 0),
      weatherCode: code,
      description: weatherCodeDescription(code),
    };

    const days: WeatherDaily[] = daily.time.map((date: string, i: number) => {
      const dayCode = Number(daily.weather_code?.[i] ?? 0);
      return {
        date,
        weatherCode: dayCode,
        description: weatherCodeDescription(dayCode),
        tempMaxC: Number(daily.temperature_2m_max?.[i] ?? 0),
        tempMinC: Number(daily.temperature_2m_min?.[i] ?? 0),
        precipitationMm: Number(daily.precipitation_sum?.[i] ?? 0),
        windMaxKmh: Number(daily.wind_speed_10m_max?.[i] ?? 0),
      };
    });

    return {
      ok: true,
      data: {
        timezone: String(json.timezone ?? "auto"),
        current,
        daily: days,
      },
    };
  } catch {
    return { ok: false, message: "Could not reach the weather service. Check your connection." };
  }
}

export function formatWeatherTime(isoLocal: string): string {
  if (!isoLocal) return "";
  try {
    const d = new Date(isoLocal);
    return d.toLocaleString(undefined, {
      weekday: "short",
      day: "numeric",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return isoLocal;
  }
}

export function formatDayLabel(dateStr: string): string {
  try {
    const d = new Date(dateStr + "T12:00:00");
    return d.toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" });
  } catch {
    return dateStr;
  }
}

export { windDirectionLabel };
