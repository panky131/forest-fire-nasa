import React, { Dispatch, SetStateAction } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AlertsDurationType, AlertsResponseDataType } from '@/utils/Types';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { filterByDuration } from '@/utils/functions/filterAlertsByDuration';

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  alertsDuration: AlertsDurationType;
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>;
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>,
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

const StatsFilterBox = ({ setAlertsDuration, alertsDuration,
  alertsData, setFilteredAlertsData }: ComponentPropType) => {
  const handleFilterButtonClick = (duration: AlertsDurationType) => {
    setAlertsDuration(duration);

    if (duration === 'all') {
      return setFilteredAlertsData(alertsData);
    }

    setFilteredAlertsData(filterByDuration(alertsData, duration));
  };

  const filterButtons = [
    { duration: 'all', label: 'All' },
    { duration: '24hrs', label: '24 Hours' },
    { duration: '1week', label: '1 Week' },
    { duration: '15days', label: '15 Days' }
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
    </View>
  );
};
export default StatsFilterBox

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
})