import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import RemarkInputTextArea from '@/components/designs/NotAFire/RemarkInputTextArea';
import AskUserForImage from '@/components/designs/NotAFire/NotAFireMCR/AskUserForImage';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';
import SubmitReportButton from '@/components/designs/NotAFire/NotAFireMCR/SubmitReportButton';
import SelectImageButtonHolder from '@/components/designs/NotAFire/NotAFireMCR/SelectImageButtonHolder';

const NotAFireMCR = () => {

  const params = useLocalSearchParams();
  const { alert_id } = params;

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [remarkInput, setRemarkInput] = useState<string>('');
  const [pickedImage, setPickedImage] = useState<string | undefined>('');
  const [doesUserHasImage, setDoesUserHasImage] = useState<boolean>(false);

  const SelectImage = (): React.JSX.Element => {
    return (
      <>
        <PickedImageHolder pickedImage={pickedImage} />
        <SelectImageButtonHolder setPickedImage={setPickedImage} />
      </>
    )
  }

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
      <KeyboardAwareScrollView style={styles.scrollView}>

        <AskUserForImage
          setPickedImage={setPickedImage}
          doesUserHasImage={doesUserHasImage}
          setDoesUserHasImage={setDoesUserHasImage} />

        {doesUserHasImage && <SelectImage />}

        <RemarkInputTextArea
          remarkInput={remarkInput}
          setRemarkInput={setRemarkInput} />

        <SubmitReportButton
          alert_id={alert_id}
          setPageLoading={setPageLoading} setLoadingText={setLoadingText}
          pickedImage={pickedImage} remarkInput={remarkInput} />

      </KeyboardAwareScrollView>
    </View>
  )
}

export default NotAFireMCR;

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  }
});