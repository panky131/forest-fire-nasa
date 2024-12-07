import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';
import RemarkInputTextArea from '@/components/designs/NotAFire/RemarkInputTextArea';
import CaptureImageButton from '@/components/designs/NotAFire/NotAFireUser/CaptureImageButton';
import SubmitReportButton from '@/components/designs/NotAFire/NotAFireUser/SubmitReportButton';
import CaptureImageModal from '@/components/designs/NotAFire/NotAFireUser/CaptureImageModal';

const NotAFire = () => {

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [remarkInput, setRemarkInput] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | undefined>('');
  const [isCaptureImageModalOpen, setIsCaptureImageModalOpen] = useState<boolean>(false);

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />

      {isCaptureImageModalOpen &&
        <CaptureImageModal
          isCaptureImageModalOpen={isCaptureImageModalOpen}
          setIsCaptureImageModalOpen={setIsCaptureImageModalOpen}
          setCapturedImage={setCapturedImage}
        />}

      <KeyboardAwareScrollView style={styles.scrollView}>

        <PickedImageHolder pickedImage={capturedImage} />
        <CaptureImageButton setIsCaptureImageModalOpen={setIsCaptureImageModalOpen} />

        <RemarkInputTextArea
          remarkInput={remarkInput}
          setRemarkInput={setRemarkInput} />

        <SubmitReportButton
          setLoadingText={setLoadingText}
          setPageLoading={setPageLoading}
          pickedImage={capturedImage}
          remarkInput={remarkInput}
        />

      </KeyboardAwareScrollView>
    </View>
  )
}

export default NotAFire

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  }
});