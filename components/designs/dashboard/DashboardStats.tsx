import { StyleSheet, View, TouchableOpacity } from "react-native";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";


import { ThemedText } from "@/components/ThemedText";
import StatsFilterBox from "./_subComponents/StatsFilterBox";
import { AlertsDurationType, AlertsResponseDataType } from "@/utils/Types";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";
import { filterByDuration } from "@/utils/functions/filterAlertsByDuration";

interface StatsBoxPropType {
  statsValue: number | string | undefined;
  statsLabel: string;
  statBoxBgColor: string;
  status: 'all' | 'active' | 'being_held' | 'closed';
  alertsData: AlertsResponseDataType[],
  alertsDuration: AlertsDurationType,
  durationFilterAlerts: AlertsResponseDataType[],
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>,
}

interface AlertsStatsType {
  totalAlerts: number;
  activeAlerts: number;
  closedAlerts: number;
  beingHeld: number;
}

interface ComponentPropType {
  filteredAlertsData: AlertsResponseDataType[],
  alertsData: AlertsResponseDataType[],
  alertsDuration: AlertsDurationType,
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>,
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>,
}

const DashboardStats = (
  { alertsDuration, alertsData, setAlertsDuration,
    setFilteredAlertsData, filteredAlertsData }: ComponentPropType) => {

  const [statsData, setStatsData] = useState<AlertsStatsType>();
  const [durationFilterAlerts, setDurationFilterAlerts] = useState<AlertsResponseDataType[]>([]);

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
    setDurationFilterAlerts(filterByDuration(alertsData, alertsDuration));
    setFilteredAlertsData(filterByDuration(alertsData, alertsDuration));
    return () => { }
  }, [alertsData])


  useEffect(() => {
    setStatsData(calculateAlertsStats(durationFilterAlerts));
    return () => { }
  }, [durationFilterAlerts])

  const statsBoxes = [
    { label: "Total Alerts", value: statsData?.totalAlerts, color: "#0a9396", status: 'all' },
    { label: "Active Alerts", value: statsData?.activeAlerts, color: "#89023e", status: 'active' },
    { label: "Being Held", value: statsData?.beingHeld, color: "#f3722c", status: 'being_held' },
    { label: "Closed Alerts", value: statsData?.closedAlerts, color: "#588157", status: 'closed' }
  ];

  return (
    <View style={styles.statsContainer}>
      <StatsFilterBox
        setDurationFilterAlerts={setDurationFilterAlerts}
        alertsData={alertsData}
        setFilteredAlertsData={setFilteredAlertsData}
        alertsDuration={alertsDuration} setAlertsDuration={setAlertsDuration} />

      {[0, 2].map(index => (
        <View key={index} style={styles.flexBoxContainer}>
          {statsBoxes.slice(index, index + 2).map(box => (
            <StatsBox
              key={box.label}
              statsLabel={box.label}
              statsValue={box.value || 0}
              statBoxBgColor={box.color}
              alertsDuration={alertsDuration}
              durationFilterAlerts={durationFilterAlerts}
              alertsData={durationFilterAlerts}
              setFilteredAlertsData={setFilteredAlertsData}
              status={box.status as 'all' | 'active' | 'being_held' | 'closed'}
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
  status,
  alertsData,
  alertsDuration,
  durationFilterAlerts,
  setFilteredAlertsData
}: StatsBoxPropType) => {

  const handleStatusFilter = () => {
    if (status === 'all') {
      setFilteredAlertsData(durationFilterAlerts);
      return;
    }

    const filteredByStatus = alertsData.filter(alert => alert.status === status);

    setFilteredAlertsData(filterByDuration(filteredByStatus, alertsDuration));
  }

  return (
    <TouchableOpacity onPress={handleStatusFilter} style={[styles.statsBox, { backgroundColor: statBoxBgColor }]}>
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
    paddingVertical: verticalScale(5),
    borderRadius: moderateScale(8),
    display: "flex",
    gap: verticalScale(10),
  },
  flexBoxContainer: {
    display: "flex",
    flexDirection: "row",
    gap: horizontalScale(10),
  },
  statsBox: {
    flex: 1,
    backgroundColor: "#eee",
    borderRadius: moderateScale(10),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: verticalScale(10),
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
