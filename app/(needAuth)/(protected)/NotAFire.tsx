import { Camera } from 'expo-camera';
import * as Location from 'expo-location';
import { Picker } from 'react-native-rapi-ui';
import Toast from 'react-native-toast-message';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useIsFocused } from '@react-navigation/native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { ThemedText } from '@/components/ThemedText';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';
import CaptureImageButton from '@/components/designs/NotAFire/NotAFireUser/CaptureImageButton';
import SubmitReportButton from '@/components/designs/NotAFire/NotAFireUser/SubmitReportButton';
import CaptureImageModal from '@/components/designs/NotAFire/NotAFireUser/CaptureImageModal';
import ImageAvailableRadioButton from '@/components/designs/NotAFire/NotAFireUser/ImageAvailableRadioButton';

const NotAFire = () => {

  const categoryItems = [
    { label: 'Fire Drill', value: 'Fire Drill' },
    { label: 'Control Fire', value: 'Control Fire' },
    { label: 'Habitat Management', value: 'Habitat Management' },
    { label: 'False Alarm or No Fire', value: 'False Alarm or No Fire' },
    { label: 'Fire Outside RF', value: 'Fire Outside RF' },
    { label: 'Fire in Agriculture/Non-Forest Land', value: 'Fire in Agriculture/Non-Forest Land' },
    { label: 'Others', value: 'others' }
  ];

  const params = useLocalSearchParams();
  const { alert_id } = params;

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [isImageAvailable, setIsImageAvailable] = useState<boolean>(false);
  const [categoryValue, setCategoryValue] = useState<string>('');
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

        <ImageAvailableRadioButton
          isImageAvailable={isImageAvailable}
          setIsImageAvailable={setIsImageAvailable} />

        {
          isImageAvailable &&
          <>
            <PickedImageHolder pickedImage={capturedImage} />
            <CaptureImageButton setIsCaptureImageModalOpen={setIsCaptureImageModalOpen} />
          </>
        }

        <View>
          <ThemedText style={styles.remarkText}>
            Category
          </ThemedText>
          <Picker
            items={categoryItems}
            value={categoryValue}
            placeholder="Choose fire category"
            onValueChange={(val: any) => setCategoryValue(val)}
          />
        </View>

        <SubmitReportButton
          setRemarkInput={setCategoryValue}
          setCapturedImage={setCapturedImage}
          alert_id={alert_id}
          setLoadingText={setLoadingText}
          setPageLoading={setPageLoading}
          pickedImage={capturedImage}
          remarkInput={categoryValue}
        />

      </KeyboardAwareScrollView>
    </View>
  )
}

export default NotAFire

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  },
  remarkText: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(5),
    fontSize: moderateScale(15),
  },
});