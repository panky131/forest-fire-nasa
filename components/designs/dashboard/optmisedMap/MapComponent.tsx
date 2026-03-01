import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import AlertsStats from './AlertsStats';
import { horizontalScale } from '@/utils/Metrics';
import AlertsDurationAndOptions from './AlertsDurationAndOptions';

export type AlertsDuration = '3 Days' | '24 hrs';
export type AlertStatus = 'ALL' | 'ACTIVE ALERT' | 'BEING_HELD' | 'NOT A FIRE' | 'CLOSED ALERT';

export interface AlertsFilter {
  alertsDuration: AlertsDuration;
  visibleAlerts: {
    alertStatus: AlertStatus;
    withinDistance: 'ALL' | 1 | 5 | 10;
  };
};

const createInitialAlertsFilter = (): AlertsFilter => {
  return {
    alertsDuration: "3 Days",
    visibleAlerts: {
      alertStatus: "ALL",
      "withinDistance": "ALL"
    }
  };
};

const MapComponent = () => {
  const [alertsFilter, setAlertsFilter] = useState<AlertsFilter>(createInitialAlertsFilter());

  return (
    <View style={styles.mapComponentContainer}>
      <AlertsDurationAndOptions
        setAlertsFilter={setAlertsFilter}
        alertsFilter={alertsFilter} />
      <AlertsStats
        setAlertsFilter={setAlertsFilter}
        alertsFilter={alertsFilter} />
    </View>
  );
};

const styles = StyleSheet.create({
  mapComponentContainer: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: horizontalScale(5)
  }
});

export default MapComponent;
