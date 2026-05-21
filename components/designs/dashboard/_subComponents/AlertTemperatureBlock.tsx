import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { fetchCurrentTemperatureAtPoint } from "@/utils/functions/fetchWeather";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

type Props = {
  latitude: number;
  longitude: number;
};

/** Compact column for the alert callout summary row. */
const AlertTemperatureBlock = ({ latitude, longitude }: Props) => {
  const [loading, setLoading] = useState(true);
  const [temperatureC, setTemperatureC] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setTemperatureC(null);

    fetchCurrentTemperatureAtPoint(latitude, longitude).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setTemperatureC(result.temperatureC);
        setError(null);
      } else {
        setError(result.message);
      }
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [latitude, longitude]);

  return (
    <View style={styles.cell}>
      <ThemedText style={styles.label}>Temp.</ThemedText>
      {loading ? (
        <ActivityIndicator size="small" color="#0a9396" style={styles.spinner} />
      ) : error ? (
        <ThemedText style={styles.errorText}>
          —
        </ThemedText>
      ) : (
        <ThemedText style={styles.value}>
          {temperatureC != null ? `${temperatureC}°` : "—"}
        </ThemedText>
      )}
    </View>
  );
};

export default AlertTemperatureBlock;

const styles = StyleSheet.create({
  cell: {
    flex: 0.65,
    minWidth: 0,
    paddingHorizontal: horizontalScale(2),
    justifyContent: "center",
  },
  label: {
    fontSize: moderateScale(9),
    fontFamily: "NotoSans_SemiBold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: verticalScale(1),
  },
  value: {
    fontSize: moderateScale(14),
    fontFamily: "NotoSans_Bold",
    color: "#0a9396",
    lineHeight: moderateScale(17),
    width: "100%",
  },
  spinner: {
    marginTop: verticalScale(2),
  },
  errorText: {
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "#b45309",
    width: "100%",
  },
});
