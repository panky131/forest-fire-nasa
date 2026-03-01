import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { AlertsFilter, AlertStatus } from './MapComponent';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

export interface AlertsStatsProp {
  alertsFilter: AlertsFilter;
  setAlertsFilter: Dispatch<SetStateAction<AlertsFilter>>;
}

const AlertsStats = ({ alertsFilter, setAlertsFilter }: AlertsStatsProp) => {

  const statsBoxes: {
    label: string,
    value: number | null,
    status: AlertStatus,
    color: string;
  } = [
      { label: "Not forest fire", value: statsData?.notAFireAlerts, color: "#333", status: 'not_fire' },
      { label: "Active Alerts", value: statsData?.activeAlerts, color: "#89023e", status: 'active' },
      { label: "Being Held", value: statsData?.beingHeld, color: "#f3722c", status: 'being_held' },
      { label: "Closed Alerts", value: statsData?.closedAlerts, color: "#588157", status: 'closed' }
    ];

  return (
    <View>
      <View style={styles.flexBoxContainer}>
        <StatsBox
          statsLabel={"Total Alerts"}
          statsValue={statsData?.totalAlerts || 0}
          statBoxBgColor={'#0a9396'}
          alertsDuration={alertsDuration}
          durationFilterAlerts={durationFilterAlerts}
          alertsData={durationFilterAlerts}
          setFilteredAlertsData={setFilteredAlertsData}
          status={'all' as 'all' | 'active' | 'being_held' | 'closed' | 'not_fire'}
        />
      </View>

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
              status={box.status as 'all' | 'active' | 'being_held' | 'closed' | 'not_fire'}
            />
          ))}
        </View>
      ))}

    </View>
  );
};

export default AlertsStats;


interface StatsBoxProp {
  alertsCount: number,
  onPress: (alert_type: string) => void,
  boxBgColor: string;
  boxLabel: string;
  alertType: AlertStatus;
}

const StatsBox = ({ alertsCount, onPress, boxBgColor, boxLabel, alertType }: StatsBoxProp) => {
  return (
    <TouchableOpacity onPress={() => onPress(alertType)} style={[styles.statsBox, { backgroundColor: boxBgColor }]}>
      <ThemedText style={styles.boxLabelText} type="default">
        {boxLabel}
      </ThemedText>
      <View style={{ backgroundColor: "#fff", width: 1, height: "100%" }} />
      <ThemedText style={styles.boxValueText} type="defaultSemiBold">
        {alertsCount}
      </ThemedText>
    </TouchableOpacity>
  );
};


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
    flexDirection: 'row',
    gap: horizontalScale(10),
  },
  boxValueText: {
    fontSize: moderateScale(17),
    color: "#fff",
  },
  boxLabelText: {
    fontSize: moderateScale(12),
    color: "#fff",
  }
});
