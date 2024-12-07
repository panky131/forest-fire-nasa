import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import PickedImageHolder from '@/components/designs/NotAFire/NotAFireMCR/PickedImageHolder';
import SelectImageButtonHolder from '@/components/designs/NotAFire/NotAFireMCR/SelectImageButtonHolder';

const NotAFireMCR = () => {

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');
  const [pickedImage, setPickedImage] = useState<string | undefined>('');

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
      <KeyboardAwareScrollView style={styles.scrollView}>

        <PickedImageHolder pickedImage={pickedImage} />
        <SelectImageButtonHolder setPickedImage={setPickedImage} />

      </KeyboardAwareScrollView>
    </View >
  )
}

export default NotAFireMCR;

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  }
});