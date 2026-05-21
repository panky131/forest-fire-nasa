import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as SecureStore from "expo-secure-store";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

import { useAuth } from "@/hooks/useAuth";
import {
  fetchWeatherForecast,
  formatDayLabel,
  formatWeatherTime,
  type WeatherForecast,
  windDirectionLabel,
} from "@/utils/functions/fetchWeather";
import {
  resolveShortPlaceNameFromCoords,
  resolveWeatherCoordinates,
  shortenDisplayLabel,
  type WeatherCoordsSource,
} from "@/utils/functions/resolvePlaceName";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

function parseCoord(value: unknown): number | null {
  const n = parseFloat(String(value ?? "").trim());
  return Number.isFinite(n) ? n : null;
}

function weatherIconName(code: number): keyof typeof Ionicons.glyphMap {
  if (code === 0) return "sunny-outline";
  if (code <= 3) return "cloudy-outline";
  if (code === 45 || code === 48) return "cloud-outline";
  if (code >= 51 && code <= 67) return "rainy-outline";
  if (code >= 71 && code <= 77) return "snow-outline";
  if (code >= 80 && code <= 82) return "rainy-outline";
  if (code >= 85 && code <= 86) return "snow-outline";
  if (code >= 95) return "thunderstorm-outline";
  return "cloud-outline";
}

export default function WeatherScreen() {
  const { authUserData }: {
    authUserData: { latitude?: unknown; longitude?: unknown; user_name?: string | null };
  } = useAuth();

  const [location, setLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [coordsSource, setCoordsSource] = useState<WeatherCoordsSource>("login");
  const [placeName, setPlaceName] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [forecast, setForecast] = useState<WeatherForecast | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWeather = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      let loginLat = parseCoord(authUserData?.latitude);
      let loginLon = parseCoord(authUserData?.longitude);

      if (loginLat == null || loginLon == null) {
        loginLat = parseCoord(await SecureStore.getItemAsync("latitude"));
        loginLon = parseCoord(await SecureStore.getItemAsync("longitude"));
      }

      if (loginLat == null || loginLon == null) {
        setError("Login location is not available. Please sign in again.");
        setLocation(null);
        setPlaceName(null);
        setForecast(null);
        return;
      }

      const divisionName =
        (authUserData?.user_name && String(authUserData.user_name).trim()) ||
        (await SecureStore.getItemAsync("user_name")) ||
        "";

      const coords = await resolveWeatherCoordinates(
        loginLat,
        loginLon,
        divisionName
      );

      const { lat, lon, source } = coords;
      setLocation({ lat, lon });
      setCoordsSource(source);
      setLocationLabel(
        divisionName ? shortenDisplayLabel(divisionName) : ""
      );

      const [result, resolvedPlace] = await Promise.all([
        fetchWeatherForecast(lat, lon),
        resolveShortPlaceNameFromCoords(lat, lon),
      ]);

      setPlaceName(resolvedPlace);

      if (!result.ok) {
        setError(result.message);
        setForecast(null);
        return;
      }

      setForecast(result.data);
    } catch {
      setError("Could not load weather.");
      setForecast(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [authUserData?.latitude, authUserData?.longitude, authUserData?.user_name]);

  useEffect(() => {
    loadWeather();
  }, [loadWeather]);

  if (loading && !refreshing) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0a9396" />
        <Text style={styles.muted}>Loading weather for your location…</Text>
      </View>
    );
  }

  if (error && !forecast) {
    return (
      <View style={styles.center}>
        <Ionicons name="cloud-offline-outline" size={48} color="#94a3b8" />
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => loadWeather()}>
          <Text style={styles.retryText}>Try again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const cur = forecast?.current;

  return (
    <SafeAreaView edges={["bottom", "left", "right"]} style={styles.outer}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => loadWeather(true)} />
        }
      >
        <View style={styles.headerCard}>
          <Text style={styles.headerEyebrow}>
            {coordsSource === "device"
              ? "Weather at your current location"
              : "Weather at login location"}
          </Text>
          {placeName ? (
            <Text style={styles.placeName} numberOfLines={1} ellipsizeMode="tail">
              {placeName}
            </Text>
          ) : null}
          {locationLabel && coordsSource === "login" ? (
            <Text
              style={placeName ? styles.headerSubtitle : styles.headerTitle}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {locationLabel}
            </Text>
          ) : !placeName ? (
            <Text style={styles.headerTitle}>Your division</Text>
          ) : null}
          {location ? (
            <Text style={styles.coords}>
              {location.lat.toFixed(4)}°, {location.lon.toFixed(4)}°
            </Text>
          ) : null}
        </View>

        {cur ? (
          <View style={styles.currentCard}>
            <View style={styles.currentTop}>
              <Ionicons
                name={weatherIconName(cur.weatherCode)}
                size={moderateScale(56)}
                color="#0a9396"
              />
              <View style={styles.currentTemps}>
                <Text style={styles.tempMain}>{Math.round(cur.temperatureC)}°C</Text>
                <Text style={styles.tempFeels}>
                  Feels like {Math.round(cur.apparentTemperatureC)}°C
                </Text>
              </View>
            </View>
            <Text style={styles.condition}>{cur.description}</Text>
            <Text style={styles.updated}>
              Updated {formatWeatherTime(cur.time)}
              {forecast?.timezone ? ` · ${forecast.timezone}` : ""}
            </Text>

            <View style={styles.metricsRow}>
              <Metric icon="water-outline" label="Humidity" value={`${Math.round(cur.humidityPercent)}%`} />
              <Metric
                icon="flag-outline"
                label="Wind"
                value={`${Math.round(cur.windSpeedKmh)} km/h ${windDirectionLabel(cur.windDirectionDeg)}`}
              />
              <Metric
                icon="rainy-outline"
                label="Rain"
                value={`${cur.precipitationMm.toFixed(1)} mm`}
              />
            </View>
          </View>
        ) : null}

        {forecast?.daily?.length ? (
          <View style={styles.forecastSection}>
            <Text style={styles.sectionTitle}>7-day outlook</Text>
            {forecast.daily.map((day) => (
              <View key={day.date} style={styles.dayRow}>
                <View style={styles.dayLeft}>
                  <Ionicons
                    name={weatherIconName(day.weatherCode)}
                    size={moderateScale(28)}
                    color="#334155"
                  />
                  <View>
                    <Text style={styles.dayLabel}>{formatDayLabel(day.date)}</Text>
                    <Text style={styles.dayDesc} numberOfLines={1}>
                      {day.description}
                    </Text>
                  </View>
                </View>
                <View style={styles.dayRight}>
                  <Text style={styles.dayTemps}>
                    {Math.round(day.tempMaxC)}° / {Math.round(day.tempMinC)}°
                  </Text>
                  <Text style={styles.dayMeta}>
                    {day.precipitationMm > 0
                      ? `${day.precipitationMm.toFixed(1)} mm rain`
                      : "Dry"}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        <Text style={styles.attribution}>Forecast by Open-Meteo</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={moderateScale(20)} color="#0a9396" />
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: "#f1f5f9",
  },
  scrollContent: {
    padding: horizontalScale(16),
    paddingBottom: verticalScale(24),
    gap: verticalScale(12),
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: horizontalScale(24),
    backgroundColor: "#f1f5f9",
  },
  muted: {
    marginTop: verticalScale(12),
    color: "#64748b",
    fontFamily: "NotoSans_SemiBold",
    fontSize: moderateScale(14),
  },
  error: {
    marginTop: verticalScale(12),
    color: "#c1121f",
    fontFamily: "NotoSans_SemiBold",
    fontSize: moderateScale(15),
    textAlign: "center",
  },
  retryBtn: {
    marginTop: verticalScale(16),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(24),
    backgroundColor: "#0a9396",
    borderRadius: moderateScale(8),
  },
  retryText: {
    color: "#fff",
    fontFamily: "NotoSans_Bold",
    fontSize: moderateScale(14),
  },
  headerCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    padding: horizontalScale(16),
    paddingVertical: verticalScale(14),
  },
  headerEyebrow: {
    fontSize: moderateScale(12),
    fontFamily: "NotoSans_SemiBold",
    color: "#64748b",
  },
  placeName: {
    marginTop: verticalScale(6),
    fontSize: moderateScale(20),
    fontFamily: "NotoSans_Bold",
    color: "#0a9396",
    lineHeight: moderateScale(26),
  },
  headerTitle: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(18),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
  },
  headerSubtitle: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(14),
    fontFamily: "NotoSans_SemiBold",
    color: "#475569",
  },
  coords: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "#94a3b8",
  },
  currentCard: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    padding: horizontalScale(16),
    paddingVertical: verticalScale(16),
  },
  currentTop: {
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(16),
  },
  currentTemps: {
    flex: 1,
  },
  tempMain: {
    fontSize: moderateScale(42),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
    lineHeight: moderateScale(48),
  },
  tempFeels: {
    fontSize: moderateScale(14),
    fontFamily: "NotoSans_SemiBold",
    color: "#64748b",
  },
  condition: {
    marginTop: verticalScale(8),
    fontSize: moderateScale(18),
    fontFamily: "NotoSans_Bold",
    color: "#0a9396",
  },
  updated: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "#94a3b8",
  },
  metricsRow: {
    flexDirection: "row",
    marginTop: verticalScale(16),
    gap: horizontalScale(8),
  },
  metric: {
    flex: 1,
    backgroundColor: "#f8fafc",
    borderRadius: moderateScale(10),
    padding: horizontalScale(8),
    paddingVertical: verticalScale(10),
    alignItems: "center",
  },
  metricLabel: {
    marginTop: verticalScale(4),
    fontSize: moderateScale(10),
    fontFamily: "NotoSans_SemiBold",
    color: "#64748b",
  },
  metricValue: {
    marginTop: verticalScale(2),
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_Bold",
    color: "#334155",
    textAlign: "center",
  },
  forecastSection: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    padding: horizontalScale(12),
    paddingVertical: verticalScale(12),
  },
  sectionTitle: {
    fontSize: moderateScale(15),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
    marginBottom: verticalScale(8),
    paddingHorizontal: horizontalScale(4),
  },
  dayRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(4),
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
  },
  dayLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: horizontalScale(10),
  },
  dayLabel: {
    fontSize: moderateScale(14),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
  },
  dayDesc: {
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "#64748b",
    maxWidth: horizontalScale(140),
  },
  dayRight: {
    alignItems: "flex-end",
  },
  dayTemps: {
    fontSize: moderateScale(14),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
  },
  dayMeta: {
    fontSize: moderateScale(10),
    fontFamily: "NotoSans_SemiBold",
    color: "#94a3b8",
    marginTop: verticalScale(2),
  },
  attribution: {
    textAlign: "center",
    fontSize: moderateScale(10),
    fontFamily: "NotoSans_SemiBold",
    color: "#94a3b8",
    marginTop: verticalScale(4),
  },
});
