import React, { useEffect, useState, useCallback } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import * as Location from "expo-location";
import { WebView } from "react-native-webview";
import URLs from "@/utils/URLs";

const WEATHER_BASE_URL = URLs.api_base_url + "../" + "weather/index.html";

export default function WeatherScreen() {
  const [location, setLocation] = useState<{
    lat: number;
    lon: number;
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    try {
      setLoading(true);

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setLocation({
        lat: loc.coords.latitude,
        lon: loc.coords.longitude,
      });

    } catch (err: any) {
      setError("Failed to fetch location");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={styles.text}>Fetching your location...</Text>
      </View>
    );
  }

  if (error || !location) {
    return (
      <View style={styles.center}>
        <Text style={styles.error}>{error || "Something went wrong"}</Text>
      </View>
    );
  }

  const uri = `${WEATHER_BASE_URL}?lat=${location.lat}&lon=${location.lon}`;

  return (
    <WebView
      source={{ uri }}
      style={{ flex: 1 }}
      startInLoadingState
      renderLoading={() => (
        <View style={styles.center}>
          <ActivityIndicator size="large" />
        </View>
      )}
      javaScriptEnabled
      domStorageEnabled
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "#f8fafc",
  },
  text: {
    marginTop: 10,
    color: "#64748b",
  },
  error: {
    color: "red",
    fontSize: 16,
  },
});