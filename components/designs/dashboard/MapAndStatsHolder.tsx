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
  const [alertsDuration, setAlertsDuration] = useState<AlertsDurationType>('1week');

  const fetchAlerts = async (): Promise<void> => {
    const fetchedAlerts = await getAlertsData({
      setPageError: setIsRequestError,
      setIsLoading,
      alertsDuration
    });

    setAlertsData(fetchedAlerts);
  };

  useEffect(() => {
    fetchAlerts();
  }, [alertsDuration]);

  if (isLoading) return <LoadingView />;
  if (isRequestError) return <ErrorScreen />;

  return (
    <>
      <DashboardStats
        alertsDuration={alertsDuration}
        alertsData={alertsData}
        setAlertsDuration={setAlertsDuration} />
      <MapComponent
        authUserData={authUserData}
        userCoordinates={userCoordinates}
        setUserCoordinates={setUserCoordinates}
        alertsData={alertsData} fetchAlerts={fetchAlerts} />
    </>
  );
};

export default MapAndStatsHolder;
