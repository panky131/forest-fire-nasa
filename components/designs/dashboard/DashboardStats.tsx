import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
  Text
} from "react-native";

import * as SecureStore from "expo-secure-store";

import URLs from "@/utils/URLs";
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
  alertsData: AlertsResponseDataType[]
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>
}

const DashboardStats = ({ alertsData, setAlertsDuration }: ComponentPropType) => {
  const [statsData, setStatsData] = useState<AlertsStatsType>();

  const calculateAlertsStats = (alertsData: AlertsResponseDataType[]): AlertsStatsType => {
    console.log(alertsData);

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


  return (
    <View style={styles.statsContainer}>
      <StatsFilterBox setAlertsDuration={setAlertsDuration} />

      <View style={styles.flexBoxContainer}>
        <StatsBox
          statsLabel="Total Alerts"
          statsValue={
            statsData && statsData.totalAlerts ? statsData.totalAlerts : 0
          }
          statBoxBgColor="#0a9396"
        />
        <StatsBox
          statsLabel="Active Alerts"
          statsValue={
            statsData && statsData.activeAlerts ? statsData.activeAlerts : 0
          }
          statBoxBgColor="#89023e"
        />
      </View>
      <View style={styles.flexBoxContainer}>
        <StatsBox
          statsLabel="Being Held"
          statsValue={
            statsData && statsData.beingHeld ? statsData.beingHeld : 0
          }
          statBoxBgColor="#f3722c"
        />
        <StatsBox
          statsLabel="Closed Alerts"
          statsValue={
            statsData && statsData.closedAlerts ? statsData.closedAlerts : 0
          }
          statBoxBgColor="#588157"
        />
      </View>
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
