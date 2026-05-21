import { StyleSheet, View, TouchableOpacity, Text } from "react-native";
import React, { Dispatch, SetStateAction, useCallback, useEffect, useState } from "react";

import DashboardCategoryNav from "./_subComponents/DashboardCategoryNav";
import { AlertsDurationType, AlertsResponseDataType } from "@/utils/Types";
import { filterByDuration } from "@/utils/functions/filterAlertsByDuration";
import {
  applyDashboardAlertFilters,
  beatIsNearForest,
  DashboardFireScope,
} from "@/utils/functions/applyDashboardAlertFilters";
import { excludeNearForestAlerts } from "@/utils/functions/nearForestBeat";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

type StatFilterStatus =
  | "all"
  | "active_non_nf"
  | "being_held"
  | "closed"
  | "not_fire";

interface StatsBoxPropType {
  statsValue: number | string | undefined;
  statsLabel: string;
  statBoxBgColor: string;
  status: StatFilterStatus;
  alertsData: AlertsResponseDataType[];
  alertsDuration: AlertsDurationType;
  durationFilterAlerts: AlertsResponseDataType[];
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>;
  fireScope: DashboardFireScope;
  setFireScope: Dispatch<SetStateAction<DashboardFireScope>>;
}

interface AlertsStatsType {
  totalAlerts: number;
  activeAlerts: number;
  closedAlerts: number;
  beingHeld: number;
  notAFireAlerts: number;
}

interface ComponentPropType {
  filteredAlertsData: AlertsResponseDataType[];
  alertsData: AlertsResponseDataType[];
  alertsDuration: AlertsDurationType;
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>;
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>;
}

const DashboardStats = ({
  alertsDuration,
  alertsData,
  setAlertsDuration,
  setFilteredAlertsData,
}: ComponentPropType) => {
  const [statsData, setStatsData] = useState<AlertsStatsType>();
  const [durationFilterAlerts, setDurationFilterAlerts] = useState<AlertsResponseDataType[]>([]);
  const [fireScope, setFireScope] = useState<DashboardFireScope>("operational");

  const pushFilters = useCallback(
    (duration: AlertsDurationType, scope: DashboardFireScope) => {
      const base = applyDashboardAlertFilters({
        alertsData,
        alertsDuration: duration,
        slice: "main",
        fireScope: "all",
      });
      setDurationFilterAlerts(base);

      const mapList = applyDashboardAlertFilters({
        alertsData,
        alertsDuration: duration,
        slice: "main",
        fireScope: scope,
      });
      setFilteredAlertsData(mapList);
    },
    [alertsData, setFilteredAlertsData]
  );

  useEffect(() => {
    pushFilters(alertsDuration, fireScope);
  }, [alertsData, alertsDuration, fireScope, pushFilters]);

  useEffect(() => {
    const base = excludeNearForestAlerts(
      alertsDuration === "all"
        ? alertsData
        : filterByDuration(alertsData, alertsDuration)
    );
    const activeOnly = base.filter((alert) => alert.status === "active");
    const activeAlerts = activeOnly.filter((alert) => !beatIsNearForest(alert.beat)).length;
    const beingHeld = base.filter((alert) => alert.status === "being_held").length;
    const closedAlerts = base.filter((alert) => alert.status === "closed").length;
    const notAFireAlerts = base.filter((alert) => alert.status === "not_fire").length;

    setStatsData({
      totalAlerts: base.length,
      activeAlerts,
      beingHeld,
      closedAlerts,
      notAFireAlerts,
    });
  }, [alertsData, alertsDuration]);

  const setDuration = (duration: AlertsDurationType) => {
    setAlertsDuration(duration);
  };

  const statsBoxes: { label: string; value: number | undefined; color: string; status: StatFilterStatus }[] = [
    { label: "Active Alerts", value: statsData?.activeAlerts, color: "#c1121f", status: "active_non_nf" },
    { label: "Being Held", value: statsData?.beingHeld, color: "#f3722c", status: "being_held" },
    { label: "Not forest fire", value: statsData?.notAFireAlerts, color: "#333", status: "not_fire" },
    { label: "Closed fire", value: statsData?.closedAlerts, color: "#588157", status: "closed" },
  ];

  const pairedRows: (typeof statsBoxes)[] = [];
  for (let i = 0; i < statsBoxes.length - 1; i += 2) {
    pairedRows.push(statsBoxes.slice(i, i + 2));
  }
  const lastStatBox =
    statsBoxes.length % 2 === 1 ? statsBoxes[statsBoxes.length - 1] : null;

  return (
    <View style={styles.statsContainer}>
      <DashboardCategoryNav
        active="fire"
        onSelectFire={() => {
          setFireScope("operational");
          pushFilters(alertsDuration, "operational");
        }}
      />

      <View style={styles.totalRow}>
        <StatsBox
          statsLabel="Total Alerts"
          statsValue={statsData?.totalAlerts || 0}
          statBoxBgColor="#0a9396"
          alertsDuration={alertsDuration}
          durationFilterAlerts={durationFilterAlerts}
          alertsData={durationFilterAlerts}
          setFilteredAlertsData={setFilteredAlertsData}
          status="all"
          fireScope={fireScope}
          setFireScope={setFireScope}
          flexStyle={styles.totalBoxFlex}
        />
        <DurationPill
          label="3 Days"
          active={alertsDuration === "3days"}
          onPress={() => setDuration("3days")}
        />
        <DurationPill
          label="24 Hours"
          active={alertsDuration === "24hrs"}
          onPress={() => setDuration("24hrs")}
        />
      </View>

      {pairedRows.map((row, rowIndex) => (
        <View key={`row-${rowIndex}`} style={styles.flexBoxContainer}>
          {row.map((box) => (
            <StatsBox
              key={box.label}
              statsLabel={box.label}
              statsValue={box.value || 0}
              statBoxBgColor={box.color}
              alertsDuration={alertsDuration}
              durationFilterAlerts={durationFilterAlerts}
              alertsData={durationFilterAlerts}
              setFilteredAlertsData={setFilteredAlertsData}
              status={box.status}
              fireScope={fireScope}
              setFireScope={setFireScope}
            />
          ))}
        </View>
      ))}

      {lastStatBox ? (
        <View style={styles.fullWidthRow}>
          <StatsBox
            statsLabel={lastStatBox.label}
            statsValue={lastStatBox.value || 0}
            statBoxBgColor={lastStatBox.color}
            alertsDuration={alertsDuration}
            durationFilterAlerts={durationFilterAlerts}
            alertsData={durationFilterAlerts}
            setFilteredAlertsData={setFilteredAlertsData}
            status={lastStatBox.status}
            fireScope={fireScope}
            setFireScope={setFireScope}
          />
        </View>
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

const StatsBox = ({
  statsValue,
  statsLabel,
  statBoxBgColor,
  status,
  alertsData,
  alertsDuration,
  durationFilterAlerts,
  setFilteredAlertsData,
  fireScope,
  setFireScope,
  flexStyle,
}: StatsBoxPropType & { flexStyle?: object }) => {
  const handleStatusFilter = () => {
    if (status === "all") {
      setFireScope("all");
      setFilteredAlertsData(durationFilterAlerts);
      return;
    }

    let filteredByStatus: AlertsResponseDataType[];
    if (status === "active_non_nf") {
      filteredByStatus = alertsData.filter(
        (alert) => alert.status === "active" && !beatIsNearForest(alert.beat)
      );
    } else {
      filteredByStatus = alertsData.filter((alert) => alert.status === status);
    }

    setFireScope("all");
    setFilteredAlertsData(filterByDuration(filteredByStatus, alertsDuration));
  };

  return (
    <TouchableOpacity
      onPress={handleStatusFilter}
      activeOpacity={0.85}
      style={[styles.statsBox, { backgroundColor: statBoxBgColor }, flexStyle]}
    >
      <View style={styles.statsBoxLabelCol}>
        <Text style={styles.boxLabelText} numberOfLines={2}>
          {statsLabel}
        </Text>
      </View>
      <View style={styles.statsBoxDivider} />
      <View style={styles.statsBoxValueCol}>
        <Text style={styles.boxValueText}>{statsValue}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default DashboardStats;

const styles = StyleSheet.create({
  statsContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: horizontalScale(12),
    paddingVertical: verticalScale(2),
    borderRadius: moderateScale(8),
    display: "flex",
    gap: verticalScale(4),
  },
  totalRow: {
    flexDirection: "row",
    alignItems: "stretch",
    gap: horizontalScale(6),
    marginBottom: verticalScale(2),
  },
  totalBoxFlex: {
    flex: 1.35,
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
  flexBoxContainer: {
    display: "flex",
    flexDirection: "row",
    gap: horizontalScale(8),
  },
  fullWidthRow: {
    width: "100%",
    flexDirection: "row",
  },
  statsBox: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: moderateScale(10),
    flexDirection: "row",
    alignItems: "stretch",
    justifyContent: "center",
    minHeight: verticalScale(46),
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(6),
    overflow: "hidden",
  },
  statsBoxLabelCol: {
    flex: 1.15,
    justifyContent: "center",
    paddingRight: horizontalScale(4),
  },
  statsBoxValueCol: {
    flex: 0.85,
    justifyContent: "center",
    alignItems: "center",
    minWidth: horizontalScale(40),
  },
  statsBoxDivider: {
    width: StyleSheet.hairlineWidth * 2,
    alignSelf: "stretch",
    backgroundColor: "rgba(255,255,255,0.45)",
    marginHorizontal: horizontalScale(4),
  },
  boxValueText: {
    fontSize: moderateScale(18),
    lineHeight: moderateScale(22),
    fontFamily: "NotoSans_Bold",
    color: "#ffffff",
    textAlign: "center",
    textShadowColor: "rgba(0,0,0,0.35)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  boxLabelText: {
    fontSize: moderateScale(11),
    lineHeight: moderateScale(14),
    fontFamily: "NotoSans_SemiBold",
    color: "#ffffff",
    textAlign: "left",
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
});
