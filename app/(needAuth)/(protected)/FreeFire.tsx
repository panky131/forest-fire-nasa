import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AlertsApiStatusBanner from '@/components/designs/dashboard/AlertsApiStatusBanner';
import LoadingView from '@/components/designs/dashboard/LoadingView';
import MapComponent from '@/components/designs/dashboard/MapComponent';
import NearForestMapControls from '@/components/designs/dashboard/_subComponents/NearForestMapControls';
import { useAuth } from '@/hooks/useAuth';
import { applyDashboardAlertFilters } from '@/utils/functions/applyDashboardAlertFilters';
import { getAlertsData } from '@/utils/functions/getAlerts';
import { onlyNearForestAlerts } from '@/utils/functions/nearForestBeat';
import {
  ensureBeatsForestDataLoaded,
  scheduleBeatsForestDataLoad,
} from '@/utils/beatsKmz/beatsKmzService';
import {
  buildNearForestDistanceMap,
  filterNearForestByBoundaryDistance,
  nearForestAlertsWithinMaxDistance,
  nearForestDistanceBucketCounts,
  NearForestDistanceFilter,
} from '@/utils/beatsKmz/nearForestBoundaryDistance';
import { AlertsDurationType, AlertsResponseDataType, UserCoordsType } from '@/utils/Types';

const FreeFire = () => {
  const { authUserData }: any = useAuth();
  const appState = useRef(AppState.currentState);

  const [isLoading, setIsLoading] = useState(false);
  const [alertsError, setAlertsError] = useState<{
    message: string;
    httpStatus: number | null;
    apiStatus: string | null;
    responsePreview: string | null;
  } | null>(null);

  const [userCoordinates, setUserCoordinates] = useState<UserCoordsType>();
  const [alertsData, setAlertsData] = useState<AlertsResponseDataType[]>([]);
  const [alertsDuration, setAlertsDuration] = useState<AlertsDurationType>('24hrs');
  const [filteredAlertsData, setFilteredAlertsData] = useState<AlertsResponseDataType[]>([]);
  const [durationFilteredAlerts, setDurationFilteredAlerts] = useState<AlertsResponseDataType[]>([]);
  const [distanceFilter, setDistanceFilter] = useState<NearForestDistanceFilter>('all');
  const [distanceByAlertId, setDistanceByAlertId] = useState<Map<number, number>>(new Map());
  const [boundariesReady, setBoundariesReady] = useState(false);

  const isFocused = useIsFocused();

  const applyNearForestFilters = useCallback(
    (
      nfAlerts: AlertsResponseDataType[],
      duration: AlertsDurationType,
      boundaryFilter: NearForestDistanceFilter,
      distances: Map<number, number>,
      boundariesReadyState: boolean
    ) => {
      const byDuration = applyDashboardAlertFilters({
        alertsData: nfAlerts,
        alertsDuration: duration,
        slice: 'nearForest',
        fireScope: 'all',
      });
      const scoped = nearForestAlertsWithinMaxDistance(
        byDuration,
        distances,
        boundariesReadyState
      );
      setDurationFilteredAlerts(scoped);
      const list = filterNearForestByBoundaryDistance(
        scoped,
        boundaryFilter,
        distances
      );
      setFilteredAlertsData(list);
    },
    []
  );

  const bucketCounts = useMemo(
    () => nearForestDistanceBucketCounts(durationFilteredAlerts, distanceByAlertId),
    [durationFilteredAlerts, distanceByAlertId]
  );

  const nfMapAlertsData = useMemo(
    () => nearForestAlertsWithinMaxDistance(alertsData, distanceByAlertId, boundariesReady),
    [alertsData, distanceByAlertId, boundariesReady]
  );

  const fetchAlerts = useCallback(async (): Promise<void> => {
    const result = await getAlertsData({
      setIsLoading,
      alertsDuration,
    });

    if (result.ok) {
      setAlertsError(null);
      const nf = onlyNearForestAlerts(result.alerts);
      setAlertsData(nf);
    } else {
      setAlertsError({
        message: result.userMessage ?? 'Could not load alerts.',
        httpStatus: result.httpStatus,
        apiStatus: result.apiStatus,
        responsePreview: result.responsePreview,
      });
      setAlertsData([]);
      setDurationFilteredAlerts([]);
      setFilteredAlertsData([]);
    }
  }, [alertsDuration]);

  useEffect(() => {
    if (!isFocused || alertsData.length === 0) return;
    scheduleBeatsForestDataLoad();
    let cancelled = false;
    void (async () => {
      const forest = await ensureBeatsForestDataLoaded();
      if (cancelled || !forest) return;
      setBoundariesReady(true);
      const forDuration = applyDashboardAlertFilters({
        alertsData,
        alertsDuration,
        slice: 'nearForest',
        fireScope: 'all',
      });
      const distances = buildNearForestDistanceMap(forDuration, forest);
      setDistanceByAlertId(distances);
    })();
    return () => {
      cancelled = true;
    };
  }, [alertsData, alertsDuration, isFocused]);

  useEffect(() => {
    if (alertsData.length >= 0) {
      applyNearForestFilters(
        alertsData,
        alertsDuration,
        distanceFilter,
        distanceByAlertId,
        boundariesReady
      );
    }
  }, [
    alertsDuration,
    alertsData,
    distanceFilter,
    distanceByAlertId,
    boundariesReady,
    applyNearForestFilters,
  ]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        fetchAlerts();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [fetchAlerts]);

  useEffect(() => {
    fetchAlerts();
  }, [isFocused, fetchAlerts]);

  if (isLoading) {
    return <LoadingView />;
  }

  return (
    <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.outer}>
      {alertsError ? (
        <AlertsApiStatusBanner
          message={alertsError.message}
          httpStatus={alertsError.httpStatus}
          apiStatus={alertsError.apiStatus}
          responsePreview={alertsError.responsePreview}
          onRetry={fetchAlerts}
        />
      ) : null}

      <View style={styles.filterStrip}>
        <NearForestMapControls
          totalCount={durationFilteredAlerts.length}
          between50and100Count={bucketCounts.between50and100}
          between100and500Count={bucketCounts.between100and500}
          lt50Count={bucketCounts.lt50}
          unknownCount={bucketCounts.unknown}
          boundariesReady={boundariesReady}
          distanceFilter={distanceFilter}
          setDistanceFilter={setDistanceFilter}
          alertsDuration={alertsDuration}
          setAlertsDuration={setAlertsDuration}
          onTotalPress={() =>
            applyNearForestFilters(
              alertsData,
              alertsDuration,
              'all',
              distanceByAlertId,
              boundariesReady
            )
          }
        />
      </View>

      <View style={styles.mapWrap}>
        <MapComponent
          nearForestMapMode
          filteredAlertsData={filteredAlertsData}
          setFilteredAlertsData={setFilteredAlertsData}
          authUserData={authUserData}
          userCoordinates={userCoordinates}
          setUserCoordinates={setUserCoordinates}
          alertsData={nfMapAlertsData}
          fetchAlerts={fetchAlerts}
        />
      </View>
    </SafeAreaView>
  );
};

export default FreeFire;

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  filterStrip: {
    flexShrink: 0,
  },
  mapWrap: {
    flex: 1,
    minHeight: 160,
  },
});
