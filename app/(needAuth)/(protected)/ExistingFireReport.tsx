import { StyleSheet, Image, View, Dimensions, Modal, TouchableOpacity } from 'react-native'
import React, { useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import { Button, TextInput, themeColor } from 'react-native-rapi-ui';
import { useLocalSearchParams } from 'expo-router'
import { Camera, CameraView } from 'expo-camera'
import * as Location from 'expo-location';

import { useIsFocused, useRoute } from '@react-navigation/native'

import LoadingIndicator from '@/components/designs/LoadingIndicator'
import URLs from '@/utils/URLs'
import { useAuth } from '@/hooks/useAuth'
import { ThemedText } from '@/components/ThemedText'

const path = require('path');
const mimetype = require('mimetype');

const NewFireIncident = () => {

  const { authUserData } = useAuth();
  
  const params = useLocalSearchParams();
  const { alert_id, lat, lng } = params;

  // for input fields
  const [Remark, SetRemark] = useState("");

  // camera | permission | captured image
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [camera, setCamera] = useState(null);
  const [imageUri, setImageUri] = useState(null);
  // const [type, setType] = useState(Camera.Constants.Type.back)
  const [location, setLocation] = useState("");
  const [invalidLocation, setInvalidLocation] = useState<boolean | number>(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [loading, SetPageLoading] = useState(false);
  const [PageError, SetPageError] = useState(false);

  const permissionFunction = async () => {
    try {
      SetPageLoading(true);

      // Request camera permission
      const cameraPermission = await Camera.requestCameraPermissionsAsync();
      setCameraPermission(cameraPermission.status === 'granted');

      // Request location permission
      let { status } = await Location.requestForegroundPermissionsAsync();

      if (cameraPermission.status !== 'granted' || status !== 'granted') {
        alert('Permission for Camera And Location access needed.');
        return;
      }

      // Check if location services are enabled
      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        alert('Location services are disabled.');
        return;
      }

      // Adding a delay to give time to acquire GPS signal
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Get current location with high accuracy and a timeout
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
        // timeout: 10000, // wait up to 10 seconds to get location
      });

      // setLocation(location);
      checkDistance(location.coords.latitude, location.coords.longitude); // Pass the location to the checkDistance function
    } catch (error) {
      console.log(error);
      // SetPageLoading(false);
    } finally {
      SetPageLoading(false);
    }
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

  function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
    const R = 6371000;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return parseFloat(distance.toFixed(2));
  }

  const checkDistance = async (lat2: number, long2: number) => {

    try {
      console.log('Check distance started');
      let lat1 = lat;
      let long1 = lng;

      // let lat2 = location.coords.latitude;
      // let long2 = location.coords.longitude;

      console.log(lat1);
      console.log(long1);

      console.log(lat2);
      console.log(long2);

      const distance_meters = haversine(lat1 as any, long1 as any, lat2, long2);

      setInvalidLocation(distance_meters);

      console.log(`Distance - ` + distance_meters)
    } catch (error) {
      console.log(error)
    }
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
      _finalData.append('image', capturedImage as never);
      _finalData.append('alert_id', alert_id as never);
      _finalData.append('mobile', authUserData.mobile_number);

      const response = await fetch(URLs.api_base_url + "closed_fire.php", {
        method: "POST",
        body: _finalData,
        headers: {
          // Accept: "application/json",
          "Content-Type": "multipart/form-data",
        },
      });

      const resData = await response.json();
      if (resData.status != "success") {
        SetPageError(true);
        return;
      }

      alert("Report Submitted Succesfully");
      setImageUri(null);
      SetRemark("");

    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      SetPageLoading(false);
    }
  }

  const bootsUp = async () => {
    await permissionFunction();
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    bootsUp();

  }, [isFocused])



  // if (invalidLocation as number >= 100) return (
  //   <View style={styles.invalidLocationContainer}>
  //     <LoadingIndicator text={'Loading'} visible={loading} />
  //     <View style={styles.invalidLocationImgContainer}>
  //       <Image
  //         style={styles.invalidLocationImage}
  //         source={require('../../../assets/images/invalid_location.jpg')}
  //       />
  //     </View>
  //     <ThemedText style={styles.invalidLocationText} type='default'>
  //       You are trying to capture photo from {invalidLocation} meters. Please capture within 100 meters
  //     </ThemedText>
  //     <TouchableOpacity style={styles.invalidLocationBtn} onPress={() => permissionFunction()}>
  //       <ThemedText style={styles.invalidLocationText} type='default'>
  //         Retry
  //       </ThemedText>
  //     </TouchableOpacity>
  //   </View>
  // )

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
              <ThemedText style={styles.imageText}>
                आग बुझाने की फोटो खीचें
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
                textStyle={styles.chooseBtn} size='sm' text='Choose' />
            </View>
          </View>
          <View>
            <ThemedText style={styles.remarkText}>
              Remark
            </ThemedText>
            <TextInput
              placeholder="Enter your text"
              value={Remark}
              onChangeText={(val) => SetRemark(val)}
            />
          </View>
          <View style={styles.submitBtnHolder}>
            <Button
              onPress={() => SubmitIncident()}
              textStyle={styles.submitBtn} text='Submit' status='info' />
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
  },
  // Invalid location styles
  invalidLocationContainer: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10)
  },
  invalidLocationText: {
    textAlign: 'center'
  },
  invalidLocationBtn: {
    backgroundColor: themeColor.warning600,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(2),
    marginTop: verticalScale(16)
  },
  invalidLocationImage: {
    width: '100%',
    height: verticalScale(200),
    objectFit: 'contain',
  },
  invalidLocationImgContainer: {
    backgroundColor: '#fff',
    display: 'flex',
    marginBottom: verticalScale(10)
  }
})