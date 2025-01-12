import React, { Dispatch, SetStateAction } from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { AlertsDurationType } from '@/utils/Types';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';


interface ComponentPropType {
  setAlertsDuration: Dispatch<SetStateAction<AlertsDurationType>>
}

const FilterButton = ({ duration, label, onPress }:
  { duration: AlertsDurationType, label: string, onPress: (duration: AlertsDurationType) => void }) => (
  <TouchableOpacity onPress={() => onPress(duration)} style={styles.filterBtnTextOuter}>
    <Text style={styles.filterBtnText}>{label}</Text>
  </TouchableOpacity>
)

const StatsFilterBox = ({ setAlertsDuration }: ComponentPropType) => {

  const handleFilterButtonClick = (duration: AlertsDurationType) => {
    setAlertsDuration(duration)
  }

  return (
    <View style={styles.statsFilterBtnsHolder}>
      <FilterButton duration='24hrs' label="24 Hours" onPress={() => handleFilterButtonClick('24hrs')} />
      <FilterButton duration='1week' label="1 Week" onPress={() => handleFilterButtonClick('1week')} />
      <FilterButton duration='15days' label="15 Days" onPress={() => handleFilterButtonClick('15days')} />
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