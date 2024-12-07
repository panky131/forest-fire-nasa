import { CameraView } from 'expo-camera';
import Toast from 'react-native-toast-message';
import { themeColor } from 'react-native-rapi-ui';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

interface ComponentPropType {
  isCaptureImageModalOpen: boolean,
  setIsCaptureImageModalOpen: Dispatch<SetStateAction<boolean>>,
  setCapturedImage: Dispatch<SetStateAction<string | undefined>>
}

const CaptureImageModal = (props: ComponentPropType) => {

  const { setIsCaptureImageModalOpen, isCaptureImageModalOpen, setCapturedImage }
    = props;

  const [camera, setCamera] = useState(null);

  const captureImage = async () => {
    try {
      // @ts-ignore
      const data = await camera?.takePictureAsync(null);
      setCapturedImage(data.uri);
      setIsCaptureImageModalOpen(false);

    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Some problems occured while capturing Image. Please try again later..'
      })

    }
  }

  const CaptureImageButton = () => {
    return (
      <ThemedView style={styles.clickBtnOuterContainer}>
        <TouchableOpacity style={styles.clickBtn}>
          <TouchableOpacity
            onPress={captureImage} style={styles.clickBtnInner}>
          </TouchableOpacity>
        </TouchableOpacity>
      </ThemedView>
    )
  }

  return (
    <Modal
      style={styles.modal}
      transparent={true}
      animationType="fade"
      visible={isCaptureImageModalOpen}
      onRequestClose={() => {
        setIsCaptureImageModalOpen(!isCaptureImageModalOpen);
      }}
    >

      <View style={styles.cameraViewContainer}>

        <CameraView
          ref={(ref: any) => setCamera(ref)}
          style={styles.cameraView}
        />
        <CaptureImageButton />

      </View>

    </Modal>
  )
}

export default CaptureImageModal

const styles = StyleSheet.create({
  modal: {
    position: "relative",
    flex: 1,
    paddingBottom: verticalScale(12),
    zIndex: 9999
  },
  cameraView: {
    width: '100%',
    height: '85%',
    borderRadius: moderateScale(10),
  },
  clickBtnOuterContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10),
    backgroundColor: 'transparent'
  },
  clickBtn: {
    borderColor: themeColor.info600,
    borderWidth: 2,
    padding: 3,
    borderRadius: 100
  },
  clickBtnInner: {
    width: 50,
    height: 50,
    backgroundColor: themeColor.info600,
    borderRadius: 100
  },
  cameraViewContainer: {
    display: 'flex',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10)
  }
})