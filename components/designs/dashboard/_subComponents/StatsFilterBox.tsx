import React, { Dispatch, SetStateAction } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity } from 'react-native';

import { AlertsDurationType, AlertsResponseDataType } from '@/utils/Types';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { filterByDuration } from '@/utils/functions/filterAlertsByDuration';
import { excludeNearForestAlerts } from '@/utils/functions/nearForestBeat';
import { Href, useRouter } from 'expo-router';

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  alertsDuration: AlertsDurationType;
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>;
  setDurationFilterAlerts: Dispatch<SetStateAction<AlertsResponseDataType[]>>;
  setFilteredAlertsData: Dispatch<SetStateAction<AlertsResponseDataType[]>>,
  /** Main dashboard strips NF alerts; Near Forest screen keeps NF-only lists from parent. */
  variant?: 'dashboard' | 'nearForest';
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

const NearForestAlertsNavButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(needAuth)/(protected)/FreeFire' as Href)}
      style={[styles.filterBtnTextOuter, styles.navSwapButton]}
    >
      <Text style={[styles.filterBtnText, styles.navSwapButtonText]}>
        Near Forest Alerts
      </Text>
    </TouchableOpacity>
  );
};

const ActiveAlertsNavButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
      onPress={() => router.push('/(needAuth)/(protected)/Dashboard' as Href)}
      style={[styles.filterBtnTextOuter, styles.navSwapButton]}
    >
      <Text style={[styles.filterBtnText, styles.navSwapButtonText]}>
        Active Alerts
      </Text>
    </TouchableOpacity>
  );
};

const WeatherBulletinButton = () => {
  const router = useRouter();

  return (
    <TouchableOpacity
    onPress={() => router.push('/(needAuth)/(protected)/Weather' as Href)}
      style={[styles.filterBtnTextOuter]}
    >
      <Text style={[styles.filterBtnText]}>
        Weather
      </Text>
    </TouchableOpacity>
    
  );
};

const StatsFilterBox = ({
  setAlertsDuration,
  alertsDuration,
  alertsData,
  setFilteredAlertsData,
  setDurationFilterAlerts,
  variant = 'dashboard',
}: ComponentPropType) => {
  const applyVariantSlice = (list: AlertsResponseDataType[]) =>
    variant === 'dashboard' ? excludeNearForestAlerts(list) : list;

  const handleFilterButtonClick = (duration: AlertsDurationType) => {
    setAlertsDuration(duration);

    if (duration === 'all') {
      const next = applyVariantSlice(alertsData);
      setDurationFilterAlerts(next);
      return setFilteredAlertsData(next);
    }

    const next = applyVariantSlice(filterByDuration(alertsData, duration));
    setDurationFilterAlerts(next);
    setFilteredAlertsData(next);
  };

  const filterButtons = [
    { duration: '3days', label: '3 Days' },
    { duration: '24hrs', label: '24 Hours' },
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
          isActive={alertsDuration === duration}
          duration={duration as AlertsDurationType}
          label={label}
          onPress={handleFilterButtonClick}
        />
      ))}
      {variant === 'dashboard' ? (
        <NearForestAlertsNavButton />
      ) : (
        <ActiveAlertsNavButton />
      )}
      <WeatherBulletinButton />
    </ScrollView>
  );
};
export default StatsFilterBox;

const styles = StyleSheet.create({
  statsFilterScroll: {
    width: "100%",
    flexGrow: 0,
  },
  statsFilterBtnsHolder: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "nowrap",
    paddingVertical: verticalScale(2),
    paddingRight: horizontalScale(4),
    gap: horizontalScale(4),
  },
  filterBtnTextOuter: {
    paddingVertical: verticalScale(4),
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
  },
  navSwapButton: {
    borderColor: '#0a9396',
    backgroundColor: 'rgba(10, 147, 150, 0.08)',
  },
  navSwapButtonText: {
    color: '#0a9396',
    fontFamily: 'NotoSans_Bold',
  },
});