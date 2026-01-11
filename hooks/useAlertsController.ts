import { useCallback, useMemo, useRef, useState } from 'react';

import { getAlertsData } from '@/utils/functions/getAlerts';
import { filterByDuration } from '@/utils/functions/filterAlertsByDuration';
import { AlertsDurationType, AlertsResponseDataType, UserCoordsType } from '@/utils/Types';

export type AlertsFilters = {
  duration: AlertsDurationType;
  status: 'all' | 'active' | 'being_held' | 'closed' | 'not_fire';
  distanceKm: number | null;
};

export const useAlertsController = () => {
  const [alertsData, setAlertsData] = useState<AlertsResponseDataType[]>([]);
  const [filters, setFilters] = useState<AlertsFilters>({
    duration: '24hrs',
    status: 'all',
    distanceKm: null,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [userCoordinates, setUserCoordinates] = useState<UserCoordsType>();

  const isFetchingRef = useRef(false);

  const fetchAlerts = useCallback(async () => {
    if (isFetchingRef.current) return;

    try {
      isFetchingRef.current = true;
      setIsLoading(true);
      setIsError(false);

      const data = await getAlertsData({
        setPageError: setIsError,
        setIsLoading,
        alertsDuration: filters.duration,
      });

      setAlertsData(data);
    } finally {
      isFetchingRef.current = false;
      setIsLoading(false);
    }
  }, [filters.duration]);

  const filteredAlertsData = useMemo(() => {
    let filteredAlerts = filterByDuration(alertsData, filters.duration);

    if (filters.status !== 'all') {
      filteredAlerts = filteredAlerts.filter(a => a.status === filters.status);
    }

    return filteredAlerts;
  }, [alertsData, filters.duration, filters.status]);

  return {
    alertsData,
    filteredAlertsData,
    filters,
    setFilters,
    fetchAlerts,
    isLoading,
    isError,
    userCoordinates,
    setUserCoordinates,
  };
};
