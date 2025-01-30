import { StyleSheet } from 'react-native'
import { Dispatch, SetStateAction } from 'react'
import { RadioButton } from 'react-native-rapi-ui'

import { ThemedText } from '@/components/ThemedText'
import { ThemedView } from '@/components/ThemedView'
import { horizontalScale, verticalScale } from '@/utils/Metrics'


interface ImageAvailableRadioButtonProps {
  isImageAvailable: boolean,
  setIsImageAvailable: Dispatch<SetStateAction<boolean>>
}

const ImageAvailableRadioButton = ({
  isImageAvailable,
  setIsImageAvailable
}: ImageAvailableRadioButtonProps) => {

  return (
    <ThemedView style={styles.radioButtonContainer}>
      <RadioButton value={isImageAvailable}
        onValueChange={(value: boolean) => setIsImageAvailable(value)} />
      <ThemedText>
        Do you have Image?
      </ThemedText>
    </ThemedView>
  )
}

export default ImageAvailableRadioButton

const styles = StyleSheet.create({
  radioButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    gap: horizontalScale(10),
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    marginTop: verticalScale(10)
  }
})