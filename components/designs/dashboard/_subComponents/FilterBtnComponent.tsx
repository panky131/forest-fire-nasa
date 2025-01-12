import React, { Dispatch, SetStateAction } from 'react'
import { StyleSheet, TouchableOpacity } from 'react-native'

import { ThemedText } from '@/components/ThemedText'
import { filterMapAlertsFunctions } from './FilterMapAlertFunctions'
import { AlertsResponseDataType, UserCoordsType } from '@/utils/Types'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

interface FilterBtnComponentPropType {
  btnText: string,
  isActive: boolean,
  isActiveText: string,
  rangeInKMToShow: number,
  alertsDataSet: AlertsResponseDataType[],
  userCoordinates: UserCoordsType | undefined,
  setWhichActiveBtn: Dispatch<SetStateAction<string>>,
  setAlertsData: Dispatch<SetStateAction<AlertsResponseDataType[]>>
}

const FilterBtnComponent = ({ isActive, btnText, rangeInKMToShow,
  alertsDataSet, setAlertsData, userCoordinates, setWhichActiveBtn, isActiveText }: FilterBtnComponentPropType) => {

  const handleFilter = () => {
    filterMapAlertsFunctions({
      alertsDataSet: alertsDataSet,
      setAlertsData: setAlertsData,
      rangeInKmToCheck: rangeInKMToShow,
      userCoordinates: userCoordinates
    });
    setWhichActiveBtn(isActiveText);
  }

  return (
    <TouchableOpacity onPress={() => handleFilter()} style={[styles.filterButton, isActive ? styles.activeBtnStyle : null]}>
      <ThemedText style={[styles.filterBtnText, isActive ? styles.activeFilterBtnText : null]}>
        {btnText}
      </ThemedText>
    </TouchableOpacity>
  )
}

export default FilterBtnComponent

const styles = StyleSheet.create({
  filterButton: {
    borderColor: 'rgba(0,0,0,.7)',
    borderWidth: 2,
    paddingHorizontal: horizontalScale(20),
    paddingVertical: verticalScale(1),
    borderRadius: moderateScale(200)
  },
  filterBtnText: {
    fontSize: moderateScale(12)
  },
  activeBtnStyle: {
    backgroundColor: 'rgba(0,0,0,0.7)',
  },
  activeFilterBtnText: {
    color: '#fff'
  }
})