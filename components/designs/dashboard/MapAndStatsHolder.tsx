import { AppState, StyleSheet, View } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

import LoadingView from "./LoadingView";
import MapComponent from "./MapComponent";
import { useAuth } from "@/hooks/useAuth";
import DashboardStats from "./DashboardStats";
import AlertsApiStatusBanner from "./AlertsApiStatusBanner";
import { getAlertsData } from "@/utils/functions/getAlerts";
import { applyDashboardAlertFilters } from "@/utils/functions/applyDashboardAlertFilters";
import { excludeNearForestAlerts } from "@/utils/functions/nearForestBeat";
import { AlertsDurationType, AlertsResponseDataType, UserCoordsType } from "@/utils/Types";

const MapAndStatsHolder: React.FC = () => {
  const { authUserData }: any = useAuth();
  const appState = useRef(AppState.currentState);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [alertsError, setAlertsError] = useState<{
    message: string;
    httpStatus: number | null;
    apiStatus: string | null;
    responsePreview: string | null;
  } | null>(null);

  const [userCoordinates, setUserCoordinates] = useState<UserCoordsType>();
  const [alertsData, setAlertsData] = useState<AlertsResponseDataType[]>([]);
  const [alertsDuration, setAlertsDuration] = useState<AlertsDurationType>("24hrs");
  const [filteredAlertsData, setFilteredAlertsData] = useState<AlertsResponseDataType[]>([]);

  const fetchAlerts = useCallback(async (): Promise<void> => {
    const result = await getAlertsData({
      setIsLoading,
      alertsDuration,
    });

    if (result.ok) {
      setAlertsError(null);
      setAlertsData(result.alerts);
      setFilteredAlertsData(
        applyDashboardAlertFilters({
          alertsData: result.alerts,
          alertsDuration,
          slice: "main",
          fireScope: "operational",
        })
      );
    } else {
      setAlertsError({
        message: result.userMessage ?? "Could not load alerts.",
        httpStatus: result.httpStatus,
        apiStatus: result.apiStatus,
        responsePreview: result.responsePreview,
      });
      setAlertsData([]);
      setFilteredAlertsData([]);
    }
  }, [alertsDuration]);

  const isFocused = useIsFocused();

  const mapAlertsData = useMemo(
    () => excludeNearForestAlerts(alertsData),
    [alertsData]
  );

  useEffect(() => {
    const subscription = AppState.addEventListener("change", async (nextAppState) => {
      if (nextAppState === "active") {
        fetchAlerts();
      }
      appState.current = nextAppState;
      console.log("AppState:", appState.current);
    });

    return () => subscription.remove();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [isFocused, fetchAlerts]);

  if (isLoading) return <LoadingView />;

  return (
    <View style={styles.root}>
      {alertsError ? (
        <AlertsApiStatusBanner
          message={alertsError.message}
          httpStatus={alertsError.httpStatus}
          apiStatus={alertsError.apiStatus}
          responsePreview={alertsError.responsePreview}
          onRetry={fetchAlerts}
        />
      ) : null}

      <View style={styles.statsSection}>
        <DashboardStats
          filteredAlertsData={filteredAlertsData}
          alertsDuration={alertsDuration}
          alertsData={alertsData}
          setFilteredAlertsData={setFilteredAlertsData}
          setAlertsDuration={setAlertsDuration}
        />
      </View>

      <View style={styles.mapSection}>
        <MapComponent
          filteredAlertsData={filteredAlertsData}
          setFilteredAlertsData={setFilteredAlertsData}
          authUserData={authUserData}
          userCoordinates={userCoordinates}
          setUserCoordinates={setUserCoordinates}
          alertsData={mapAlertsData}
          fetchAlerts={fetchAlerts}
        />
      </View>
    </View>
  );
};

export default MapAndStatsHolder;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    flexDirection: "column",
  },
  /** Stats stay natural height so the map can use the rest of the screen. */
  statsSection: {
    flexShrink: 0,
    flexGrow: 0,
  },
  mapSection: {
    flex: 1,
    minHeight: 160,
  },
});
