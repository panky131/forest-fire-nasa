import { StyleSheet } from 'react-native';
import { RadioButton } from 'react-native-rapi-ui';
import React, { Dispatch, SetStateAction } from 'react';

import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, verticalScale } from '@/utils/Metrics';

interface ComponentPropType {
  doesUserHasImage: boolean,
  setDoesUserHasImage: Dispatch<SetStateAction<boolean>>,
  setPickedImage: Dispatch<SetStateAction<string | undefined>>
}

const AskUserForImage = (props: ComponentPropType) => {

  const { doesUserHasImage, setDoesUserHasImage, setPickedImage } = props;

  const handleRadioButtonChange = (value: boolean) => {
    setDoesUserHasImage(value);

    if (!value) {
      setPickedImage('');
    }
  }

  return (
    <ThemedView style={styles.radioButtonContainer}>
      <RadioButton value={doesUserHasImage}
        onValueChange={(value: boolean) => handleRadioButtonChange(value)} />
      <ThemedText>
        Do you have Image?
      </ThemedText>
    </ThemedView>
  )
}

export default AskUserForImage

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