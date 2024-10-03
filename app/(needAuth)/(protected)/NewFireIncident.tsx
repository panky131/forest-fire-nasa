import { StyleSheet, Image, View, Dimensions, Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Camera, CameraView } from 'expo-camera'
import * as Location from 'expo-location';
import { Button, TextInput, themeColor } from 'react-native-rapi-ui'

import { useIsFocused } from '@react-navigation/native'

import LoadingIndicator from '@/components/designs/LoadingIndicator'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import { useAuth } from '@/hooks/useAuth'
import URLs from '@/utils/URLs'
import { ThemedText } from '@/components/ThemedText'

const path = require('path');
const mimetype = require('mimetype');

const NewFireIncident = () => {

  const { authUserData } = useAuth();
  // for input fields
  const [Remark, SetRemark] = useState("");

  // camera | permission | captured image
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  // @ts-ignore
  // const [type, setType] = useState(Camera.Constants.Type.back)
  const [imagePadding, setImagePadding] = useState(0);
  const [ratio, setRatio] = useState('4:3');  // default is 4:3
  const { height, width } = Dimensions.get('window');
  const screenRatio = height / width;
  const [isRatioSet, setIsRatioSet] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, SetPageLoading] = useState(false);
  const [PageError, SetPageError] = useState(false);

  const permisionFunction = async () => {
    // here is how you can get the camera permission
    // @ts-ignore
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    setCameraPermission(cameraPermission.status === 'granted');
    let { status } = await Location.requestForegroundPermissionsAsync();

    if (
      cameraPermission.status !== 'granted' || status !== 'granted'
    ) {
      alert('Permission for Camera And Location access needed.');
      return;
    }

    let location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const captureImage = async () => {
    // @ts-ignore
    const data = await camera?.takePictureAsync(null);
    setImageUri(data.uri);
    setModalVisible(false);
  }

  const takePicture = async () => {
    setModalVisible(true);
  };

  const getFileName = (uri: string) => {
    return path.basename(uri);
  }
  const getFileMIME = (uri: string) => {
    return mimetype.lookup(uri);
  }

  const SubmitIncident = async () => {
    try {

      if (!Remark || !imageUri) {
        alert("Image must be clicked and remark must be filled out");
        return;
      }

      SetPageLoading(true);

      let capturedImage = {
        uri: imageUri,
        name: getFileName(imageUri),
        type: getFileMIME(imageUri)
      };

      const _finalData = new FormData();
      _finalData.append('message', Remark);
      _finalData.append('image', capturedImage as any);
      // Conditionally append latitude and longitude if available
      if (location?.coords.latitude && location?.coords.longitude) {
        _finalData.append('lat', location?.coords.latitude as never);
        _finalData.append('lng', location?.coords.longitude as never);
      } else {
        // If either latitude or longitude is not available, pass 0
        _finalData.append('lat', 0 as never);
        _finalData.append('lng', 0 as never);
      }
      _finalData.append('mobile', authUserData.mobile_number);
      _finalData.append('type', 'Fire');
      _finalData.append('name', authUserData.user_name);
      _finalData.append('division_id', authUserData.division_id);

      const response = await fetch(URLs.api_base_url + "submit_incident.php", {
        method: "POST",
        body: _finalData,
        headers: {
          // Accept: "application/json", 
          "Content-Type": "multipart/form-data",
        },
      });

      const resData = await response.json();
      console.log(resData);
      if (resData.status != "success") {
        // SetPageError(true);
        return;
      }

      alert("Report Submitted Succesfully");
      setImageUri(null);
      SetRemark("");

    } catch (error) {

      console.log(error);
      // SetPageError(true);

    } finally {
      SetPageLoading(false);
    }
  }
  useEffect(() => {
    permisionFunction();
    return () => { }
  }, [])


  const isFocused = useIsFocused();

  // useEffect(() => {
  //   SetPageLoading(false);
  //   SetPageError(false);

  //   return () => { }
  // }, [isFocused])



  return (
    <View>
      <LoadingIndicator text={'Loading'} visible={loading} />
      <Modal
        style={{
          position: "relative",
          flex: 1,
          paddingBottom: verticalScale(12)
        }}
        transparent={false}
        animationType="slide"
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(!modalVisible);
        }}
      >
        <View style={{
          display: 'flex',
          alignItems: 'center',
          paddingHorizontal: horizontalScale(10),
          paddingVertical: verticalScale(10)
        }}>
          <CameraView
            ref={(ref: any) => setCamera(ref)}
            // onCameraReady={setCameraReady}
            style={{
              width: '100%',
              height: '80%',
              borderRadius: moderateScale(10),

            }}
            // @ts-ignore
            // type={type}
            // ratio={ratio}
            // @ts-ignore
            autoFocus={'on'}
          />
          <View style={styles.clickBtnOuterContainer}>
            <TouchableOpacity style={styles.clickBtn}>
              <TouchableOpacity onPress={() => captureImage()} style={styles.clickBtnInner}></TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <KeyboardAwareScrollView style={styles.scrollView}>
        <View style={styles.inputHolder}>
          <View>
            <View style={styles.captureImageBox}>
              <ThemedText style={styles.imageText} type='default'>
                नई आग की फोटो खीचें
              </ThemedText>
              <Image
                // @ts-ignore
                source={{ uri: imageUri }}
                style={styles.captureImage}
              />
            </View>
            <View style={styles.chooseBtnHolder}>
              <Button
                onPress={() => takePicture()}
                textStyle={styles.chooseBtn} size='sm' text='Capture Photo \ फोटो खीचें' />
            </View>
          </View>
          <View>
            <ThemedText type='defaultSemiBold' style={styles.remarkText}>
              Remark \ टिप्पणी
            </ThemedText>
            <TextInput
              placeholder="Enter your text \ टिप्पणी लिखें"
              value={Remark}
              onChangeText={(val) => SetRemark(val)}
            />
          </View>
          <View style={styles.submitBtnHolder}>
            <Button
              onPress={() => SubmitIncident()}
              textStyle={styles.submitBtn} text='Report fire \ वनाग्नि की सूचना दें' status='info' />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

export default NewFireIncident

const styles = StyleSheet.create({
  headerImage: {
    width: '100%',
    height: verticalScale(200),
    borderRadius: moderateScale(5),
    marginTop: verticalScale(10)
  },
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  },
  remarkText: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(5),
    fontSize: moderateScale(15),
  },
  inputHolder: {
    marginTop: verticalScale(10)
  },
  captureImageBox: {
    width: '100%',
    height: verticalScale(320),
    backgroundColor: 'rgba(0,0,0,.1)',
    position: 'relative',
    borderRadius: moderateScale(5),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  imageText: {
    position: 'absolute',
    color: 'rgba(0,0,0,.7)',
    fontSize: moderateScale(15),
  },
  captureImage: {
    width: '100%',
    height: '100%',
    zIndex: 1,
    position: 'absolute'
  },
  chooseBtnHolder: {
    display: 'flex',
    flexDirection: 'row',
    marginTop: verticalScale(5),
    alignItems: 'center',
    justifyContent: 'center'
  },
  chooseBtn: {
    paddingHorizontal: horizontalScale(15),
    paddingVertical: verticalScale(5)
  },
  submitBtnHolder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10)
  },
  submitBtn: {
    minWidth: horizontalScale(200),
    textAlign: 'center'
  },
  clickBtnOuterContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: verticalScale(10)
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
  }
})