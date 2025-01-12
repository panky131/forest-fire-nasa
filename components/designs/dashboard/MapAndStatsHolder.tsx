import React, { useEffect, useState } from 'react';

import LoadingView from './LoadingView';
import MapComponent from './MapComponent';
import DashboardStats from './DashboardStats';
import ErrorScreen from '@/app/(needAuth)/ErrorScreen';
import { getAlertsData } from '@/utils/functions/getAlerts';
import { AlertsDurationType, AlertsResponseDataType } from '@/utils/Types';

const MapAndStatsHolder: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isRequestError, setIsRequestError] = useState<boolean>(false);
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
      <DashboardStats alertsData={alertsData}
        setAlertsDuration={setAlertsDuration} />
      <MapComponent alertsData={alertsData} fetchAlerts={fetchAlerts} />
    </>
  );
};

export default MapAndStatsHolder;
