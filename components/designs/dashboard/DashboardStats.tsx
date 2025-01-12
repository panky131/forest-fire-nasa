import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";


import { ThemedText } from "@/components/ThemedText";
import StatsFilterBox from "./_subComponents/StatsFilterBox";
import { AlertsDurationType, AlertsResponseDataType } from "@/utils/Types";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

interface StatsBoxPropType {
  statsValue: number | string | undefined;
  statsLabel: string;
  statBoxBgColor: string;
}

interface AlertsStatsType {
  totalAlerts: number;
  activeAlerts: number;
  closedAlerts: number;
  beingHeld: number;
}

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  alertsDuration: AlertsDurationType,
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>
}

const DashboardStats = ({ alertsDuration, alertsData, setAlertsDuration }: ComponentPropType) => {
  const [statsData, setStatsData] = useState<AlertsStatsType>();

  const calculateAlertsStats = (alertsData: AlertsResponseDataType[]): AlertsStatsType => {
    const activeAlerts = alertsData.filter(alert => alert.status === "active").length;
    const beingHeld = alertsData.filter(alert => alert.status === "being_held").length;
    const closedAlerts = alertsData.filter(alert => alert.status === "closed").length;

    return {
      totalAlerts: alertsData.length,
      activeAlerts,
      beingHeld,
      closedAlerts
    };
  };

  useEffect(() => {
    setStatsData(calculateAlertsStats(alertsData));
    return () => { }
  }, [alertsData])

  const statsBoxes = [
    { label: "Total Alerts", value: statsData?.totalAlerts, color: "#0a9396" },
    { label: "Active Alerts", value: statsData?.activeAlerts, color: "#89023e" },
    { label: "Being Held", value: statsData?.beingHeld, color: "#f3722c" },
    { label: "Closed Alerts", value: statsData?.closedAlerts, color: "#588157" }
  ];

  return (
    <View style={styles.statsContainer}>
      <StatsFilterBox alertsDuration={alertsDuration} setAlertsDuration={setAlertsDuration} />

      {[0, 2].map(index => (
        <View key={index} style={styles.flexBoxContainer}>
          {statsBoxes.slice(index, index + 2).map(box => (
            <StatsBox
              key={box.label}
              statsLabel={box.label}
              statsValue={box.value || 0}
              statBoxBgColor={box.color}
            />
          ))}
        </View>
      ))}

    </View>
  );
};

const StatsBox = ({
  statsValue,
  statsLabel,
  statBoxBgColor,
}: StatsBoxPropType) => {
  return (
    <TouchableOpacity style={[styles.statsBox, { backgroundColor: statBoxBgColor }]}>
      <ThemedText style={styles.boxValueText} type="defaultSemiBold">
        {statsValue}
      </ThemedText>
      <ThemedText style={styles.boxLabelText} type="default">
        {statsLabel}
      </ThemedText>
    </TouchableOpacity>
  );
};

export default DashboardStats;

const styles = StyleSheet.create({
  statsContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(8),
    display: "flex",
    gap: verticalScale(10),
  },
  flexBoxContainer: {
    display: "flex",
    flexDirection: "row",
    gap: horizontalScale(10),
    aspectRatio: 16 / 4,
  },
  statsBox: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: moderateScale(10),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  boxValueText: {
    fontSize: moderateScale(17),
    color: "#fff",
  },
  boxLabelText: {
    fontSize: moderateScale(13),
    color: "#fff",
  }
});
