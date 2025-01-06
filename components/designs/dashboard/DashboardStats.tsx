import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
  TouchableOpacity,
} from "react-native";

import * as SecureStore from "expo-secure-store";

import URLs from "@/utils/URLs";
import { ThemedText } from "@/components/ThemedText";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

import FilterBtnComponent from "./_subComponents/FilterBtnComponent";

interface StatsBoxPropType {
  statsValue: number | string | undefined;
  statsLabel: string;
  statBoxBgColor: string;
}

interface ResponseDataType {
  totalAlerts: number;
  activeAlerts: number;
  closedAlerts: number;
  beingHeld: number;
}

interface AuthContextType {
  auth_key: string | null;
  mobile_number: string | number | null;
  user_type: string | null;
  user_name: null;
  latitude: number;
  longitude: number;
  division_id: number | string;
}

const DashboardStats = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRequestError, setIsRequestError] = useState<boolean>(true);

  const [statsData, setStatsData] = useState<ResponseDataType>();

  const getAlertsStatsData = async (): Promise<void> => {
    try {
      setIsLoading(true);
      setIsRequestError(false);

      const authKey: string | null = await SecureStore.getItemAsync("auth_key");
      const divisionID: string | null = await SecureStore.getItemAsync(
        "division_id"
      );
      const URL = `${URLs.api_base_url}getDashboardStats.php?auth_key=${authKey}&division_id=${divisionID}`;

      const response = await fetch(URL, {
        method: "GET",
      });

      if (response.status !== 200) {
        setIsRequestError(true);
        return;
      }

      const responseJSON = await response.json();
      const responseStatsData: ResponseDataType = responseJSON.data;
      setStatsData(responseStatsData);
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getAlertsStatsData();

    return () => {};
  }, []);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.mapHeaderComponent}>
        <TouchableOpacity>{"Alerts in 24 Hours"}</TouchableOpacity>
        <TouchableOpacity>{"Alerts in 1 Week"}</TouchableOpacity>
        <TouchableOpacity>{"Alerts in 15 Days"}</TouchableOpacity>
      </View>

      <View style={styles.flexBoxContainer}>
        <StatsBox
          statsLabel="Active Alerts"
          statsValue={
            statsData && statsData.activeAlerts ? statsData.activeAlerts : 0
          }
          statBoxBgColor="#108554"
        />
        <StatsBox
          statsLabel="Being Held"
          statsValue={
            statsData && statsData.beingHeld ? statsData.beingHeld : 0
          }
          statBoxBgColor="#dd8d31"
        />
      </View>
    </View>
  );
};

const LoadingView = (): React.JSX.Element => {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size={"large"} />
    </View>
  );
};

const StatsBox = ({
  statsValue,
  statsLabel,
  statBoxBgColor,
}: StatsBoxPropType) => {
  return (
    <View style={[styles.statsBox, { backgroundColor: statBoxBgColor }]}>
      <ThemedText style={styles.boxValueText} type="defaultSemiBold">
        {statsValue}
      </ThemedText>
      <ThemedText style={styles.boxLabelText} type="default">
        {statsLabel}
      </ThemedText>
    </View>
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
  },
  // for loading component
  loadingContainer: {
    width: "100%",
    paddingVertical: verticalScale(30),
    backgroundColor: "#fff",
  },
  mapHeaderComponent: {
    width: "100%",
    paddingVertical: verticalScale(10),
    display: "flex",
    gap: horizontalScale(4),
    flexDirection: "row",
  },
});
