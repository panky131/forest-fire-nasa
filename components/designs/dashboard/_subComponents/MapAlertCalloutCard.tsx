import React, { useEffect, useState } from "react";
import { ActivityIndicator, StyleSheet, TouchableOpacity, View } from "react-native";
import { Entypo, Ionicons } from "@expo/vector-icons";

import { ThemedText } from "@/components/ThemedText";
import { AlertsResponseDataType } from "@/utils/Types";
import { alertCapturedValue } from "@/utils/functions/alertCapturedValue";
import { formatAcqDate } from "@/utils/functions/formatAcqDate";
import { beatIsNearForest } from "@/utils/functions/nearForestBeat";
import {
  resolveAlertLocationLabel,
  type AlertLocationLabel,
} from "@/utils/functions/resolvePlaceName";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";
import AlertTemperatureBlock from "./AlertTemperatureBlock";
import FireSeverityContextBlock from "./FireSeverityContextBlock";

type Props = {
  alert: AlertsResponseDataType;
  nearForestMapMode?: boolean;
  /** Approx. metres to beat forest boundary; shown for near-forest alerts when known. */
  boundaryDistanceMetres?: number | null;
  satelliteView?: boolean;
  onClose: () => void;
  onAction: () => void;
};

function statusMeta(
  alert: AlertsResponseDataType,
  nearForestMapMode: boolean
): { title: string; badgeColor: string } {
  const nf = nearForestMapMode || beatIsNearForest(alert.beat);
  if (nf) {
    return { title: "Near Forest Alert", badgeColor: "#b8860b" };
  }
  switch (alert.status) {
    case "active":
      return { title: "Active", badgeColor: "#c1121f" };
    case "being_held":
      return { title: "Held", badgeColor: "#f48c06" };
    case "closed":
      return { title: "Closed", badgeColor: "#2d6a4f" };
    case "not_fire":
      return { title: "Not fire", badgeColor: "#495057" };
    default:
      return { title: "Alert", badgeColor: "#0a9396" };
  }
}

function displayAlertIdInCallout(
  alert: AlertsResponseDataType,
  nearForestMapMode: boolean
): string {
  const nf = nearForestMapMode || beatIsNearForest(alert.beat);
  const prefix = nf ? "NF-" : "FA-";
  return `${prefix}${alert.alert_id}`;
}

function actionLabel(status: string): string {
  if (status === "active") return "Update alert status";
  if (status === "closed") return "Alert closed";
  if (status === "not_fire") return "Not a forest fire";
  return "Close fire";
}

function SummaryCell({
  label,
  flex = 1,
  wrap = false,
  children,
}: {
  label: string;
  flex?: number;
  wrap?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={[styles.summaryCell, { flex }, wrap && styles.summaryCellWrap]}>
      <ThemedText style={styles.summaryLabel}>{label}</ThemedText>
      {children}
    </View>
  );
}

function SummaryDivider() {
  return <View style={styles.summaryDivider} />;
}

function forestTypeDisplay(alert: AlertsResponseDataType): string {
  const raw = alert.ft_type;
  if (raw == null || String(raw).trim() === "") return "—";
  return String(raw).trim();
}

function MetaChip({
  label,
  value,
  wrapValue = true,
}: {
  label: string;
  value: string | number | null | undefined;
  /** Word-wrap long names (Beat, Range, Division). */
  wrapValue?: boolean;
}) {
  const text =
    value === null || value === undefined || String(value).trim() === ""
      ? "—"
      : String(value);

  return (
    <View style={styles.metaChip}>
      <ThemedText style={styles.metaLabel}>{label}</ThemedText>
      <ThemedText
        style={[styles.metaValue, wrapValue && styles.metaValueMultiline]}
        numberOfLines={wrapValue ? undefined : 1}
        ellipsizeMode={wrapValue ? undefined : "tail"}
      >
        {text}
      </ThemedText>
    </View>
  );
}

const MapAlertCalloutCard = ({
  alert,
  nearForestMapMode = false,
  boundaryDistanceMetres,
  satelliteView = false,
  onClose,
  onAction,
}: Props) => {
  const { title, badgeColor } = statusMeta(alert, nearForestMapMode);
  const showBoundaryDistance =
    nearForestMapMode || beatIsNearForest(alert.beat);
  const acq = formatAcqDate(alertCapturedValue(alert as AlertsResponseDataType & Record<string, unknown>));
  const canAct = alert.status !== "closed" && alert.status !== "not_fire";
  const lat = parseFloat(String(alert.lat));
  const lng = parseFloat(String(alert.lng));
  const coordsOk = Number.isFinite(lat) && Number.isFinite(lng);
  const showSeverity =
    coordsOk &&
    (alert.status === "active" || alert.status === "being_held");

  const hasAcq = Boolean(acq?.dateLine || acq?.timeLine);

  const [locationLabel, setLocationLabel] = useState<AlertLocationLabel | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    if (!coordsOk) {
      setLocationLabel(null);
      return;
    }
    let cancelled = false;
    setLocationLoading(true);
    resolveAlertLocationLabel(lat, lng).then((label) => {
      if (!cancelled) {
        setLocationLabel(label);
        setLocationLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [lat, lng, coordsOk]);

  const villageLine = locationLabel?.village
    ? locationLabel.area
      ? `${locationLabel.village}, ${locationLabel.area}`
      : locationLabel.village
    : locationLabel?.area ?? null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={[styles.badge, { backgroundColor: badgeColor }]}>
          <ThemedText style={styles.badgeText}>{title}</ThemedText>
        </View>
        <TouchableOpacity
          onPress={onClose}
          style={styles.closeBtn}
          hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}
          accessibilityLabel="Close alert details"
          accessibilityRole="button"
        >
          <Entypo name="cross" size={moderateScale(20)} color="#334155" />
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        <View style={styles.summaryRow}>
          <SummaryCell label="Captured" flex={1} wrap>
            {hasAcq ? (
              <>
                {acq?.dateLine ? (
                  <ThemedText style={styles.summaryValueWrap}>{acq.dateLine}</ThemedText>
                ) : null}
                {acq?.timeLine ? (
                  <ThemedText style={styles.summaryValueWrap}>{acq.timeLine}</ThemedText>
                ) : null}
              </>
            ) : (
              <ThemedText style={styles.summaryValueWrap}>—</ThemedText>
            )}
          </SummaryCell>
          <SummaryDivider />
          <SummaryCell label="Location" flex={1.1}>
            {locationLoading ? (
              <ActivityIndicator size="small" color="#0a9396" />
            ) : (
              <ThemedText style={styles.summaryValue}>
                {villageLine ?? "—"}
              </ThemedText>
            )}
          </SummaryCell>
          {coordsOk ? (
            <>
              <SummaryDivider />
              <AlertTemperatureBlock latitude={lat} longitude={lng} />
            </>
          ) : null}
        </View>

        <View style={styles.metaRow}>
          <MetaChip
            label="ID"
            value={displayAlertIdInCallout(alert, nearForestMapMode)}
            wrapValue={false}
          />
          <MetaChip label="Beat" value={alert.beat} />
          <MetaChip label="Range" value={alert.range_name} />
          <MetaChip label="Div." value={alert.division} />
        </View>

        <View style={styles.forestTypeStrip} accessibilityRole="text">
          <View style={styles.forestTypeIconWrap}>
            <Ionicons name="leaf" size={moderateScale(18)} color="#15803d" />
          </View>
          <View style={styles.forestTypeTextCol}>
            <ThemedText
              style={styles.forestTypeLabel}
              lightColor="#166534"
              darkColor="#166534"
            >
              Forest type
            </ThemedText>
            <ThemedText
              style={styles.forestTypeValue}
              lightColor="#14532d"
              darkColor="#14532d"
            >
              {forestTypeDisplay(alert)}
            </ThemedText>
          </View>
        </View>

        {showBoundaryDistance ? (
          <View style={styles.boundaryDistanceStrip} accessibilityRole="text">
            <View style={styles.boundaryDistanceIconWrap}>
              <Ionicons name="navigate-outline" size={moderateScale(18)} color="#b45309" />
            </View>
            <View style={styles.boundaryDistanceTextCol}>
              <ThemedText
                style={styles.boundaryDistanceLabel}
                lightColor="#92400e"
                darkColor="#92400e"
              >
                Distance to forest edge
              </ThemedText>
              <ThemedText
                style={styles.boundaryDistanceValue}
                lightColor="#78350f"
                darkColor="#78350f"
              >
                {boundaryDistanceMetres != null &&
                Number.isFinite(boundaryDistanceMetres)
                  ? `${boundaryDistanceMetres} m (approx.)`
                  : "— (map loading or no boundary)"}
              </ThemedText>
              <ThemedText
                style={styles.boundaryDistanceHint}
                lightColor="#78716c"
                darkColor="#78716c"
              >
                For ground check — simplified beat boundary geometry
              </ThemedText>
            </View>
          </View>
        ) : null}

        {showSeverity ? (
          <FireSeverityContextBlock
            latitude={lat}
            longitude={lng}
            satelliteView={satelliteView}
            compact
          />
        ) : null}
      </View>

      <TouchableOpacity
        style={[styles.actionBtn, !canAct && styles.actionBtnMuted]}
        onPress={onAction}
        activeOpacity={canAct ? 0.85 : 1}
        disabled={!canAct}
      >
        <ThemedText style={[styles.actionText, !canAct && styles.actionTextMuted]}>
          {actionLabel(alert.status)}
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

export default MapAlertCalloutCard;

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: moderateScale(12),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
    shadowColor: "#0f172a",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 8,
    width: "100%",
    maxWidth: horizontalScale(380),
    alignSelf: "center",
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: horizontalScale(10),
    paddingTop: verticalScale(6),
    paddingBottom: verticalScale(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e2e8f0",
  },
  closeBtn: {
    padding: horizontalScale(4),
    borderRadius: moderateScale(20),
    backgroundColor: "#f1f5f9",
  },
  badge: {
    flex: 1,
    minWidth: 0,
    paddingHorizontal: horizontalScale(8),
    paddingVertical: verticalScale(3),
    borderRadius: moderateScale(10),
    marginRight: horizontalScale(8),
  },
  badgeText: {
    color: "#fff",
    fontFamily: "NotoSans_Bold",
    fontSize: moderateScale(13),
    lineHeight: moderateScale(16),
    width: "100%",
  },
  body: {
    paddingHorizontal: horizontalScale(10),
    paddingTop: verticalScale(4),
    paddingBottom: verticalScale(3),
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#f8fafc",
    borderRadius: moderateScale(6),
    paddingHorizontal: horizontalScale(5),
    paddingVertical: verticalScale(4),
    marginBottom: verticalScale(3),
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#e2e8f0",
  },
  summaryCell: {
    minWidth: 0,
    paddingHorizontal: horizontalScale(2),
  },
  summaryCellWrap: {
    flexShrink: 1,
  },
  summaryValueWrap: {
    fontSize: moderateScale(12),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
    lineHeight: moderateScale(15),
    width: "100%",
  },
  summaryDivider: {
    width: StyleSheet.hairlineWidth,
    alignSelf: "stretch",
    backgroundColor: "#cbd5e1",
    marginHorizontal: horizontalScale(3),
  },
  summaryLabel: {
    fontSize: moderateScale(9),
    fontFamily: "NotoSans_SemiBold",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: verticalScale(2),
  },
  summaryValue: {
    fontSize: moderateScale(12),
    fontFamily: "NotoSans_Bold",
    color: "#0f172a",
    lineHeight: moderateScale(15),
    width: "100%",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: horizontalScale(4),
    rowGap: verticalScale(4),
    marginBottom: verticalScale(3),
    alignItems: "flex-start",
  },
  metaChip: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
    minWidth: 0,
    maxWidth: "100%",
    backgroundColor: "#f1f5f9",
    borderRadius: moderateScale(4),
    paddingHorizontal: horizontalScale(4),
    paddingVertical: verticalScale(2),
    alignItems: "stretch",
  },
  metaLabel: {
    fontSize: moderateScale(9),
    fontFamily: "NotoSans_SemiBold",
    color: "#94a3b8",
    textTransform: "uppercase",
  },
  metaValue: {
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "#334155",
    marginTop: verticalScale(2),
  },
  metaValueMultiline: {
    width: "100%",
    flexShrink: 1,
    alignSelf: "stretch",
  },
  forestTypeStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(8),
    backgroundColor: "#ecfdf5",
    borderRadius: moderateScale(10),
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#86efac",
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  forestTypeIconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#dcfce7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(1),
  },
  forestTypeTextCol: {
    flex: 1,
    minWidth: 0,
  },
  forestTypeLabel: {
    fontSize: moderateScale(8),
    fontFamily: "NotoSans_SemiBold",
    color: "#166534",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.4),
    marginBottom: verticalScale(3),
  },
  forestTypeValue: {
    fontSize: moderateScale(12),
    fontFamily: "NotoSans_Bold",
    color: "#14532d",
    lineHeight: moderateScale(16),
    width: "100%",
  },
  boundaryDistanceStrip: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: horizontalScale(8),
    backgroundColor: "#fffbeb",
    borderRadius: moderateScale(10),
    borderWidth: StyleSheet.hairlineWidth * 2,
    borderColor: "#fcd34d",
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(8),
    marginBottom: verticalScale(4),
  },
  boundaryDistanceIconWrap: {
    width: moderateScale(36),
    height: moderateScale(36),
    borderRadius: moderateScale(18),
    backgroundColor: "#fef3c7",
    alignItems: "center",
    justifyContent: "center",
    marginTop: verticalScale(1),
  },
  boundaryDistanceTextCol: {
    flex: 1,
    minWidth: 0,
  },
  boundaryDistanceLabel: {
    fontSize: moderateScale(8),
    fontFamily: "NotoSans_SemiBold",
    color: "#92400e",
    textTransform: "uppercase",
    letterSpacing: moderateScale(0.4),
    marginBottom: verticalScale(3),
  },
  boundaryDistanceValue: {
    fontSize: moderateScale(12),
    fontFamily: "NotoSans_Bold",
    color: "#78350f",
    lineHeight: moderateScale(16),
    width: "100%",
  },
  boundaryDistanceHint: {
    fontSize: moderateScale(9),
    fontFamily: "NotoSans_Regular",
    color: "#78716c",
    marginTop: verticalScale(4),
    lineHeight: moderateScale(13),
    width: "100%",
  },
  actionBtn: {
    backgroundColor: "#0a9396",
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(10),
    alignItems: "center",
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e2e8f0",
  },
  actionBtnMuted: {
    backgroundColor: "#e2e8f0",
  },
  actionText: {
    color: "#fff",
    fontFamily: "NotoSans_SemiBold",
    fontSize: moderateScale(13),
    textAlign: "center",
    lineHeight: moderateScale(17),
    width: "100%",
  },
  actionTextMuted: {
    color: "#64748b",
    textAlign: "center",
  },
});
