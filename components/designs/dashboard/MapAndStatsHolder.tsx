import React, { useEffect, useState } from 'react';

import LoadingView from './LoadingView';
import MapComponent from './MapComponent';
import { useAuth } from '@/hooks/useAuth';
import DashboardStats from './DashboardStats';
import ErrorScreen from '@/app/(needAuth)/ErrorScreen';
import { getAlertsData } from '@/utils/functions/getAlerts';
import { AlertsDurationType, AlertsResponseDataType, UserCoordsType } from '@/utils/Types';

const MapAndStatsHolder: React.FC = () => {
  const { authUserData }: any = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRequestError, setIsRequestError] = useState<boolean>(false);
  const [userCoordinates, setUserCoordinates] = useState<UserCoordsType>();
  const [alertsData, setAlertsData] = useState<AlertsResponseDataType[]>([]);
  const [alertsDuration, setAlertsDuration] = useState<AlertsDurationType>('all');
  const [filteredAlertsData, setFilteredAlertsData] = useState<AlertsResponseDataType[]>([]);

  const fetchAlerts = async (): Promise<void> => {
    const fetchedAlerts = await getAlertsData({
      setPageError: setIsRequestError,
      setIsLoading,
      alertsDuration
    });

    setFilteredAlertsData(fetchedAlerts);
    setAlertsData(fetchedAlerts);
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  if (isLoading) return <LoadingView />;
  if (isRequestError) return <ErrorScreen />;

  return (
    <>
      <DashboardStats
        filteredAlertsData={filteredAlertsData}
        alertsDuration={alertsDuration}
        alertsData={alertsData}
        setFilteredAlertsData={setFilteredAlertsData}
        setAlertsDuration={setAlertsDuration} />

      <MapComponent
        filteredAlertsData={filteredAlertsData}
        setFilteredAlertsData={setFilteredAlertsData}
        authUserData={authUserData}
        userCoordinates={userCoordinates}
        setUserCoordinates={setUserCoordinates}
        alertsData={alertsData} fetchAlerts={fetchAlerts} />
    </>
  );
};

export default MapAndStatsHolder;
