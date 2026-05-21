import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import {
  fetchFireSeverityContext,
  severityBadgeColor,
  type FireSeverityContext,
} from "@/utils/functions/fetchFireSeverityContext";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

type Props = {
  latitude: number;
  longitude: number;
  satelliteView?: boolean;
  /** Single-line layout for alert callout (no scroll). */
  compact?: boolean;
};

const FireSeverityContextBlock = ({
  latitude,
  longitude,
  compact = false,
}: Props) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [ctx, setCtx] = useState<FireSeverityContext | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setCtx(null);

    fetchFireSeverityContext(latitude, longitude).then((result) => {
      if (cancelled) return;
      if (result.ok) {
        setCtx(result.data);
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

  if (compact) {
    return (
      <View style={styles.compactWrap}>
        {loading ? (
          <ActivityIndicator size="small" color="#92400e" />
        ) : error ? (
          <ThemedText style={styles.compactError}>
            Weather unavailable
          </ThemedText>
        ) : ctx ? (
          <View style={styles.compactContent}>
            <View style={styles.compactTextCol}>
              <ThemedText style={styles.compactLine}>
                Elv {ctx.elevationM != null ? `${ctx.elevationM} m` : "—"} · Humidity{" "}
                {ctx.humidityPercent}%
              </ThemedText>
              <ThemedText style={styles.compactLine}>
                Wind {ctx.windSpeedKmh} km/h from {ctx.windFromLabel}
              </ThemedText>
              <ThemedText style={styles.compactLine}>
                Spread → {ctx.spreadTowardLabel}
              </ThemedText>
            </View>
            <View
              style={[
                styles.compactRisk,
                { backgroundColor: severityBadgeColor(ctx.severity) },
              ]}
            >
              <ThemedText style={styles.compactRiskText}>
                {ctx.severityLabel.replace(" spread risk", "")}
              </ThemedText>
            </View>
          </View>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.topRow}>
        <ThemedText style={styles.title} numberOfLines={1}>
          Wind & elevation
        </ThemedText>
        {ctx && !loading ? (
          <View
            style={[
              styles.riskBadge,
              { backgroundColor: severityBadgeColor(ctx.severity) },
            ]}
          >
            <ThemedText style={styles.riskBadgeText} numberOfLines={1}>
              {ctx.severityLabel.replace(" spread risk", "")}
            </ThemedText>
          </View>
        ) : null}
      </View>

      {loading ? (
        <ActivityIndicator size="small" color="#0a9396" />
      ) : null}

      {error && !loading ? (
        <ThemedText style={styles.errorText} numberOfLines={1}>
          {error}
        </ThemedText>
      ) : null}

      {ctx && !loading ? (
        <View style={styles.metricsGrid}>
          <Cell
            label="Elevation"
            value={ctx.elevationM != null ? `${ctx.elevationM} m` : "—"}
          />
          <Cell
            label="Wind"
            value={`${ctx.windSpeedKmh} km/h ${ctx.windFromLabel}`}
          />
          <Cell label="Spread →" value={ctx.spreadTowardLabel} />
          <Cell label="Humidity" value={`${ctx.humidityPercent}%`} />
        </View>
      ) : null}
    </View>
  );
};

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.cell}>
      <ThemedText style={styles.cellLabel}>{label}</ThemedText>
      <ThemedText style={styles.cellValue} numberOfLines={1}>
        {value}
      </ThemedText>
    </View>
  );
}

export default FireSeverityContextBlock;

const styles = StyleSheet.create({
  compactWrap: {
    backgroundColor: "#fffbeb",
    borderRadius: moderateScale(6),
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(3),
    marginBottom: verticalScale(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fcd34d",
  },
  compactContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(6),
  },
  compactTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 0,
  },
  compactLine: {
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "#44403c",
    lineHeight: moderateScale(14),
    width: "100%",
  },
  compactRisk: {
    paddingHorizontal: horizontalScale(4),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(4),
    maxWidth: "32%",
    minWidth: horizontalScale(56),
  },
  compactRiskText: {
    color: "#fff",
    fontSize: moderateScale(10),
    fontFamily: "NotoSans_Bold",
    lineHeight: moderateScale(13),
    width: "100%",
  },
  compactError: {
    flex: 1,
    fontSize: moderateScale(11),
    color: "#b45309",
    fontFamily: "NotoSans_SemiBold",
    lineHeight: moderateScale(14),
    width: "100%",
  },
  wrap: {
    backgroundColor: "#fffbeb",
    borderRadius: moderateScale(6),
    paddingHorizontal: horizontalScale(6),
    paddingVertical: verticalScale(4),
    marginTop: verticalScale(2),
    marginBottom: verticalScale(2),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#fcd34d",
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: verticalScale(3),
  },
  title: {
    flex: 1,
    fontSize: moderateScale(8),
    fontFamily: "NotoSans_Bold",
    color: "#92400e",
    textTransform: "uppercase",
  },
  riskBadge: {
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(1),
    borderRadius: moderateScale(4),
  },
  riskBadgeText: {
    color: "#fff",
    fontSize: moderateScale(7),
    fontFamily: "NotoSans_Bold",
  },
  errorText: {
    fontSize: moderateScale(8),
    color: "#b45309",
    fontFamily: "NotoSans_SemiBold",
  },
  metricsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  cell: {
    width: "50%",
    paddingVertical: verticalScale(1),
  },
  cellLabel: {
    fontSize: moderateScale(7),
    fontFamily: "NotoSans_SemiBold",
    color: "#a8a29e",
  },
  cellValue: {
    fontSize: moderateScale(9),
    fontFamily: "NotoSans_Bold",
    color: "#292524",
  },
});
