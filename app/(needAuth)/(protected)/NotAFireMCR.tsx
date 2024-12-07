import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import RemarkInputTextArea from '@/components/designs/NotAFire/RemarkInputTextArea';
import PickedImageHolder from '@/components/designs/NotAFire/NotAFireMCR/PickedImageHolder';
import SubmitReportButton from '@/components/designs/NotAFire/NotAFireMCR/SubmitReportButton';
import SelectImageButtonHolder from '@/components/designs/NotAFire/NotAFireMCR/SelectImageButtonHolder';

const NotAFireMCR = () => {

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [remarkInput, setRemarkInput] = useState<string>('');
  const [pickedImage, setPickedImage] = useState<string | undefined>('');

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
      <KeyboardAwareScrollView style={styles.scrollView}>

        <PickedImageHolder pickedImage={pickedImage} />
        <SelectImageButtonHolder setPickedImage={setPickedImage} />
        <RemarkInputTextArea
          remarkInput={remarkInput} setRemarkInput={setRemarkInput} />
        <SubmitReportButton />

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