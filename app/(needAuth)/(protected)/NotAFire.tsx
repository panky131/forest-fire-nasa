import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';
import RemarkInputTextArea from '@/components/designs/NotAFire/RemarkInputTextArea';
import CaptureImageButton from '@/components/designs/NotAFire/NotAFireUser/CaptureImageButton';
import SubmitReportButton from '@/components/designs/NotAFire/NotAFireUser/SubmitReportButton';
import CaptureImageModal from '@/components/designs/NotAFire/NotAFireUser/CaptureImageModal';

const NotAFire = () => {

  const params = useLocalSearchParams();
  const { alert_id } = params;

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [remarkInput, setRemarkInput] = useState<string>('');
  const [capturedImage, setCapturedImage] = useState<string | undefined>('');
  const [isCaptureImageModalOpen, setIsCaptureImageModalOpen] = useState<boolean>(false);

  const permissionFunction = async () => {
    try {

      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (cameraPermission.status !== 'granted' || status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Permission for Camera And Location access needed.'
        });
        return;
      }

    } catch (error) {
      console.log(error);
    }
  };

  const checkPermissions = async () => {
    await permissionFunction();
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    checkPermissions();

  }, [isFocused])

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
          setRemarkInput={setRemarkInput}
          setCapturedImage={setCapturedImage}
          alert_id={alert_id}
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