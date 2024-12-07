import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import { ThemedText } from '@/components/ThemedText';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { pickSingleImage } from '@/components/designs/NotAFire/functions';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';

const NotAFireMCR = () => {

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');
  const [pickedImage, setPickedImage] = useState<string | undefined>('');

  const selectImageFromDevice = async () => {
    const selectedImage: string | undefined = await pickSingleImage();
    setPickedImage(selectedImage);
  }

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
      <KeyboardAwareScrollView style={styles.scrollView}>

        <PickedImageHolder pickedImage={pickedImage} />

        <TouchableOpacity onPress={() => selectImageFromDevice()}>
          <ThemedText>
            Select Image
          </ThemedText>
        </TouchableOpacity>

      </KeyboardAwareScrollView>
    </View >
  )
}

export default NotAFireMCR;

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  },
})