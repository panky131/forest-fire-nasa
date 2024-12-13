import { Picker } from 'react-native-rapi-ui'
import { StyleSheet, View } from 'react-native'
import React, { Dispatch, SetStateAction } from 'react'

import { ThemedText } from '@/components/ThemedText'
import { moderateScale, verticalScale } from '@/utils/Metrics'

interface ComponentPropType {
  selectedFireCategory: string,
  setSelectedFireCategory: Dispatch<SetStateAction<string>>
}

const FireCategorySelect = ({ selectedFireCategory, setSelectedFireCategory }:
  ComponentPropType) => {

  const categoryItems = [
    { label: 'Forest Fire', value: 'ForestFire' },
    { label: 'Fire Drill', value: 'Fire Drill' },
    { label: 'Control Fire', value: 'Control Fire' },
    { label: 'Habitat Management', value: 'Habitat Management' },
    { label: 'False Alarm or No Fire', value: 'False Alarm or No Fire' },
    { label: 'Fire Outside RF', value: 'Fire Outside RF' },
    { label: 'Fire in Agriculture/Non-Forest Land', value: 'Fire in Agriculture/Non-Forest Land' },
    { label: 'Others', value: 'others' }
  ];

  return (
    <View>
      <ThemedText style={styles.inputLabelText}>
        Category
      </ThemedText>
      <Picker
        items={categoryItems}
        value={selectedFireCategory}
        placeholder="Choose fire category"
        onValueChange={(value: string) => setSelectedFireCategory(value)}
      />
    </View>
  )
}

export default FireCategorySelect

const styles = StyleSheet.create({
  inputLabelText: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(5),
    fontSize: moderateScale(15),
  },
})