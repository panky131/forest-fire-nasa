import React, { Dispatch, SetStateAction } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AlertsDurationType, AlertsResponseDataType } from '@/utils/Types';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { filterByDuration } from '@/utils/functions/filterAlertsByDuration';
import { Href, useRouter } from 'expo-router';

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  alertsDuration: AlertsDurationType;
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>;
  setDurationFilterAlerts: Dispatch<SetStateAction<AlertsResponseDataType[]>>;
  setFilteredAlertsData: Dispatch<SetStateAction<AlertsResponseDataType[]>>,
}

interface FilterButtonProps {
  duration: AlertsDurationType;
  label: string;
  isActive: boolean;
  onPress: (duration: AlertsDurationType) => void;
}

const FilterButton = ({ duration, label, onPress, isActive }: FilterButtonProps) => (
  <TouchableOpacity
    onPress={() => onPress(duration)}
    style={[styles.filterBtnTextOuter, isActive && styles.activeButton]}
  >
    <Text style={[styles.filterBtnText, isActive && styles.activeButtonText]}>
      {label}
    </Text>
  </TouchableOpacity>
);

const FreeFireLinkButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(needAuth)/(protected)/FreeFire' as Href)}
      style={[styles.filterBtnTextOuter]}
    >
      <Text style={[styles.filterBtnText]}>
        Pre fire
      </Text>
    </TouchableOpacity>
  );
};

const StatsFilterBox = ({ setAlertsDuration, alertsDuration,
  alertsData, setFilteredAlertsData, setDurationFilterAlerts }: ComponentPropType) => {
  const handleFilterButtonClick = (duration: AlertsDurationType) => {
    setAlertsDuration(duration);

    if (duration === 'all') {
      setDurationFilterAlerts(alertsData);
      return setFilteredAlertsData(alertsData);
    }

    setDurationFilterAlerts(filterByDuration(alertsData, duration));
    setFilteredAlertsData(filterByDuration(alertsData, duration));
  };

  const filterButtons = [
    { duration: '3days', label: '3 Days' },
    { duration: '24hrs', label: '24 Hours' },
  ];

  return (
    <View style={styles.statsFilterBtnsHolder}>
      {filterButtons.map(({ duration, label }) => (
        <FilterButton
          key={duration}
          isActive={alertsDuration === duration}
          duration={duration as AlertsDurationType}
          label={label}
          onPress={handleFilterButtonClick}
        />
      ))}
      <FreeFireLinkButton />
    </View>
  );
};
export default StatsFilterBox;

const styles = StyleSheet.create({
  statsFilterBtnsHolder: {
    width: "100%",
    paddingVertical: verticalScale(10),
    display: "flex",
    gap: horizontalScale(4),
    flexDirection: "row",
  },
  filterBtnTextOuter: {
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(20),
    borderRadius: moderateScale(200),
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,.4)',
  },
  filterButton: {
    borderRadius: moderateScale(200)
  },
  filterBtnText: {
    fontSize: moderateScale(12),
    color: 'rgba(0,0,0,.8)'
  },
  activeButton: {
    backgroundColor: '#333',
  },
  activeButtonText: {
    color: '#fff'
  }
});