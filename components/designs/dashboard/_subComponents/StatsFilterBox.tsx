import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

type DurationType = '24Hours' | '1Week' | '15Days';

interface ComponentPropType {
  getAlertsStatsData: (duration?: DurationType) => Promise<void>
}

const FilterButton = ({ duration, label, onPress }:
  { duration: DurationType, label: string, onPress: (duration: DurationType) => void }) => (
  <TouchableOpacity onPress={() => onPress(duration)} style={styles.filterBtnTextOuter}>
    <Text style={styles.filterBtnText}>{label}</Text>
  </TouchableOpacity>
)

const StatsFilterBox = ({ getAlertsStatsData }: ComponentPropType) => {
  return (
    <View style={styles.statsFilterBtnsHolder}>
      <FilterButton duration="24Hours" label="24 Hours" onPress={getAlertsStatsData} />
      <FilterButton duration="1Week" label="1 Week" onPress={getAlertsStatsData} />
      <FilterButton duration="15Days" label="15 Days" onPress={getAlertsStatsData} />
    </View>
  )
}

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
})