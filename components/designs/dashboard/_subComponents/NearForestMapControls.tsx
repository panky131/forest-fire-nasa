import React, { Dispatch, SetStateAction } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";

import DashboardCategoryNav from "./DashboardCategoryNav";
import { AlertsDurationType } from "@/utils/Types";
import { NearForestDistanceFilter } from "@/utils/beatsKmz/nearForestBoundaryDistance";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

type Props = {
  totalCount: number;
  between50and100Count: number;
  between100and500Count: number;
  lt50Count: number;
  unknownCount: number;
  boundariesReady: boolean;
  distanceFilter: NearForestDistanceFilter;
  setDistanceFilter: Dispatch<SetStateAction<NearForestDistanceFilter>>;
  alertsDuration: AlertsDurationType;
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>;
  onTotalPress: () => void;
};

const NearForestMapControls = ({
  totalCount,
  between50and100Count,
  between100and500Count,
  lt50Count,
  unknownCount,
  boundariesReady,
  distanceFilter,
  setDistanceFilter,
  alertsDuration,
  setAlertsDuration,
  onTotalPress,
}: Props) => {
  const router = useRouter();

  return (
    <View style={styles.wrap}>
      <DashboardCategoryNav
        active="nearForest"
        onSelectFire={() => router.push("/(needAuth)/(protected)/Dashboard" as Href)}
      />

      <View style={styles.totalRow}>
        <TouchableOpacity
          onPress={() => {
            setDistanceFilter("all");
            onTotalPress();
          }}
          activeOpacity={0.85}
          style={[
            styles.totalBox,
            styles.totalBoxFlex,
            distanceFilter === "all" && styles.totalBoxActive,
          ]}
        >
          <View style={styles.totalLabelCol}>
            <Text style={styles.totalLabel} numberOfLines={2}>
              Total Alerts
            </Text>
          </View>
          <View style={styles.totalDivider} />
          <View style={styles.totalValueCol}>
            <Text style={styles.totalValue}>{totalCount}</Text>
          </View>
        </TouchableOpacity>

        <DurationPill
          label="3 Days"
          active={alertsDuration === "3days"}
          onPress={() => setAlertsDuration("3days")}
        />
        <DurationPill
          label="24 Hours"
          active={alertsDuration === "24hrs"}
          onPress={() => setAlertsDuration("24hrs")}
        />
      </View>

      <View style={styles.distanceRow}>
        <DistanceBucketBox
          label="Below 50 m"
          sublabel="from forest boundary"
          count={lt50Count}
          active={distanceFilter === "lt50"}
          disabled={!boundariesReady}
          onPress={() =>
            setDistanceFilter((prev) => (prev === "lt50" ? "all" : "lt50"))
          }
        />
        <DistanceBucketBox
          label="50 m – 100 m"
          sublabel="from forest boundary"
          count={between50and100Count}
          active={distanceFilter === "between50and100"}
          disabled={!boundariesReady}
          onPress={() =>
            setDistanceFilter((prev) =>
              prev === "between50and100" ? "all" : "between50and100"
            )
          }
        />
        <DistanceBucketBox
          label="100 m – 500 m"
          sublabel="from forest boundary"
          count={between100and500Count}
          active={distanceFilter === "between100and500"}
          disabled={!boundariesReady}
          onPress={() =>
            setDistanceFilter((prev) =>
              prev === "between100and500" ? "all" : "between100and500"
            )
          }
        />
      </View>

      {boundariesReady && unknownCount > 0 ? (
        <Text style={styles.unknownHint}>
          {unknownCount} alert{unknownCount === 1 ? "" : "s"} could not be placed on beat
          boundaries (check coordinates).
        </Text>
      ) : null}
    </View>
  );
};

function DurationPill({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[styles.durationPill, active && styles.durationPillActive]}
    >
      <Text style={[styles.durationPillText, active && styles.durationPillTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function DistanceBucketBox({
  label,
  sublabel,
  count,
  active,
  disabled,
  onPress,
}: {
  label: string;
  sublabel: string;
  count: number;
  active: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.distanceBox,
        active && styles.distanceBoxActive,
        disabled && styles.distanceBoxDisabled,
      ]}
    >
      <Text style={[styles.distanceLabel, active && styles.distanceLabelActive]} numberOfLines={2}>
        {label}
      </Text>
      <Text style={[styles.distanceSublabel, active && styles.distanceSublabelActive]} numberOfLines={1}>
        {sublabel}
      </Text>
      <Text style={[styles.distanceValue, active && styles.distanceValueActive]}>
        {disabled ? "…" : count}
      </Text>
    </TouchableOpacity>
  );
}

export default NearForestMapControls;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: horizontalScale(6),
  },
  distanceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "stretch",
    gap: horizontalScale(6),
    marginTop: verticalScale(6),
    marginBottom: verticalScale(4),
  },
  totalBoxFlex: {
    flex: 1.35,
  },
  totalBox: {
    flexDirection: "row",
    alignItems: "stretch",
    minHeight: verticalScale(46),
    borderRadius: moderateScale(10),
    backgroundColor: "#b8860b",
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(6),
    overflow: "hidden",
  },
  totalBoxActive: {
    borderWidth: 2,
    borderColor: "#333",
  },
  totalLabelCol: {
    flex: 1.15,
    justifyContent: "center",
    paddingRight: horizontalScale(4),
  },
  totalValueCol: {
    flex: 0.85,
    justifyContent: "center",
    alignItems: "center",
    minWidth: horizontalScale(40),
  },
  totalDivider: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.45)",
    marginHorizontal: horizontalScale(4),
  },
  totalLabel: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(14),
    fontFamily: "NotoSans_SemiBold",
    color: "#ffffff",
  },
  totalValue: {
    fontSize: moderateScale(18),
    lineHeight: moderateScale(22),
    fontFamily: "NotoSans_Bold",
    color: "#ffffff",
    textAlign: "center",
  },
  durationPill: {
    flex: 1,
    minHeight: verticalScale(46),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.35)",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: horizontalScale(4),
  },
  durationPillActive: {
    backgroundColor: "#333",
    borderColor: "#333",
  },
  durationPillText: {
    fontSize: moderateScale(11),
    fontFamily: "NotoSans_SemiBold",
    color: "rgba(0,0,0,0.85)",
    textAlign: "center",
  },
  durationPillTextActive: {
    color: "#fff",
    fontFamily: "NotoSans_Bold",
  },
  distanceBox: {
    flexGrow: 1,
    flexBasis: 0,
    minWidth: horizontalScale(96),
    minHeight: verticalScale(58),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.25)",
    backgroundColor: "#f5f0e6",
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(6),
    justifyContent: "center",
  },
  distanceBoxActive: {
    backgroundColor: "#2d6a4f",
    borderColor: "#1b4332",
  },
  distanceBoxDisabled: {
    opacity: 0.65,
  },
  distanceLabel: {
    fontSize: moderateScale(10),
    lineHeight: moderateScale(13),
    fontFamily: "NotoSans_SemiBold",
    color: "#333",
  },
  distanceLabelActive: {
    color: "#fff",
  },
  distanceSublabel: {
    fontSize: moderateScale(8),
    fontFamily: "NotoSans_Regular",
    color: "rgba(0,0,0,0.55)",
    marginTop: verticalScale(1),
  },
  distanceSublabelActive: {
    color: "rgba(255,255,255,0.85)",
  },
  distanceValue: {
    fontSize: moderateScale(17),
    fontFamily: "NotoSans_Bold",
    color: "#1b4332",
    marginTop: verticalScale(2),
  },
  distanceValueActive: {
    color: "#fff",
  },
  unknownHint: {
    fontSize: moderateScale(9),
    fontFamily: "NotoSans_Regular",
    color: "rgba(0,0,0,0.65)",
    marginTop: verticalScale(2),
    marginBottom: verticalScale(4),
    paddingHorizontal: horizontalScale(2),
  },
});
