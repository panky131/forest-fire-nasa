import { Href, useRouter } from 'expo-router';
import React, { Dispatch, SetStateAction } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { AlertsDuration, AlertsFilter } from './MapComponent';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

interface FilterButtonProps {
  duration: AlertsDuration;
  label: string;
  isActive: boolean;
  onPress: (duration: AlertsDuration) => void;
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
        Near Forest Alerts
      </Text>
    </TouchableOpacity>

  );
};

const WeatherBulletinButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('https://mausam.imd.gov.in/dehradun/mcdata/FOREST_FIRE_BULLETIN.pdf' as Href)}
      style={[styles.filterBtnTextOuter]}
    >
      <Text style={[styles.filterBtnText]}>
        Weather
      </Text>
    </TouchableOpacity>

  );
};

export interface AlertsDurationAndOptionsProps {
  alertsFilter: AlertsFilter;
  setAlertsFilter: Dispatch<SetStateAction<AlertsFilter>>;
}

const AlertsDurationAndOptions = ({ alertsFilter, setAlertsFilter }: AlertsDurationAndOptionsProps) => {

  const handleFilterButtonClick = (duration: AlertsDuration) => {
    setAlertsFilter(alertsFilter => {
      return ({ ...alertsFilter, alertsDuration: duration });
    });
  };

  const filterButtons = [
    { duration: '3 Days', label: '3 Days' },
    { duration: '24 Hours', label: '24 Hours' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.statsFilterScroll}
      contentContainerStyle={styles.statsFilterBtnsHolder}
      keyboardShouldPersistTaps="handled"
    >
      {filterButtons.map(({ duration, label }) => (
        <FilterButton
          key={duration}
          isActive={alertsFilter.alertsDuration === duration}
          duration={duration as AlertsDuration}
          label={label}
          onPress={handleFilterButtonClick}
        />
      ))}
      <FreeFireLinkButton />
      <WeatherBulletinButton />
    </ScrollView>
  );
};
export default AlertsDurationAndOptions;

const styles = StyleSheet.create({
  statsFilterScroll: {
    width: "100%",
    flexGrow: 0,
  },
  statsFilterBtnsHolder: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    paddingVertical: verticalScale(10),
    paddingRight: horizontalScale(4),
    gap: horizontalScale(4),
  },
  filterBtnTextOuter: {
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(12),
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