import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, TextInput, themeColor } from 'react-native-rapi-ui';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { StyleSheet, Image, View, Modal, TouchableOpacity, Text } from 'react-native'

import { useIsFocused } from '@react-navigation/native'

import URLs from '@/utils/URLs'
import { ThemedText } from '@/components/ThemedText';
import { insertRow } from '@/utils/sqlite/SQLiteFunctions';
import { tbl_fire_incidents } from '@/utils/sqlite/SQLiteDBSchema';
import LoadingIndicator from '@/components/designs/LoadingIndicator'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

const path = require('path');
const mimetype = require('mimetype');

const NewFireIncidentPublic = () => {


  const [loadingText, setLoadingText] = useState<string>("Loading");

  const [Remark, SetRemark] = useState<string>("");
  const [Name, SetName] = useState<string>("");
  const [Phone, SetPhone] = useState<string>("");
  const [OTP, SetOTP] = useState<string | null>(null);


  const [camera, setCamera] = useState(null);
  const [otpSent, setOTPsent] = useState<boolean>(false);
  const [systemOTP, setSystemOTP] = useState<string>("");
  const [otpModal, setOTPModal] = useState<boolean>(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [storedImagePath, setstoredImagePath] = useState<string | null>(null);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);


  const [loading, SetPageLoading] = useState<boolean>(false);
  const [PageError, SetPageError] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [phoneNumberVerified, SetPhoneNumberVerified] = useState(false);


  const permisionFunction = async () => {
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

  const captureAndStoreImage = async () => {
    try {
      // @ts-ignore
      const data = await camera?.takePictureAsync(null);
      setImageUri(data.uri);

      const documentDirectory = FileSystem.documentDirectory || '';
      const inspectImgDirectory = documentDirectory + 'incidents_images/';
      await FileSystem.makeDirectoryAsync(inspectImgDirectory, { intermediates: true });

      const filename: string = `incident_photo_${Date.now()}.jpg`;
      const photoPath: string = inspectImgDirectory + filename;
      await FileSystem.moveAsync({
        from: data.uri,
        to: photoPath,
      });

      setstoredImagePath(photoPath);
      setModalVisible(false);

    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Some problems ocured while processing your Image. Please try again later'
      })
    }
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

  const VerifyOTP = () => {
    try {
      if (!OTP) return;

      if (OTP == systemOTP) {
        SetPhoneNumberVerified(true);
        setOTPModal(false);
      } else {
        alert("Invalid OTP");
      }

    } catch (error) {
      console.log(error);
      alert("Unable to Verify OTP");
    }
  }

  const storeIncidentInSqliteStorage = async () => {
    try {
      setLoadingText('Uploading');
      SetPageLoading(true);

      if (!Phone || !Name || !Remark || !imageUri) {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'All input fields must be filled out'
        });
        return;
      }

      let lat, long;
      if (location?.coords.latitude && location?.coords.longitude) {
        lat = location?.coords.latitude;
        long = location?.coords.longitude

      } else {
        lat = 0;
        long = 0
      }

      const insertIncidentQuery = `INSERT INTO ${tbl_fire_incidents.tbl_name} (${[...tbl_fire_incidents.tbl_struct]}) VALUES (${Array(tbl_fire_incidents.tbl_struct.length).fill('?').join(', ')})`;
      const insertIncidentValues: any[] = [null, storedImagePath, Remark, lat, long, Phone, 'Fire', Name, 'PUBLIC_USER'];

      await insertRow({ query: insertIncidentQuery, values: insertIncidentValues });

      Toast.show({
        type: 'success',
        text1: 'Done!',
        text2: 'Report is processed successfully and will be uploaded shortly'
      });

      setImageUri(null);
      SetRemark("");
      SetName("");
      SetPhone("");
      SetOTP("");
      setstoredImagePath("");

      return;

    } catch (error) {

      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Some problems occured while processing your request. Please try again later'
      });

    } finally {
      SetPageLoading(false);
      setLoadingText('Loading');

    }
  }

  const sendOTP = async () => {
    if (phoneNumberVerified) {
      storeIncidentInSqliteStorage();
      return;
    }
    if (!Phone) {
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Please enter phone number'
      });
      return;
    }
    if (otpSent) {
      setOTPModal(true);
    } else {
      // send otp using request
      try {
        SetPageLoading(true);

        const data = new FormData();
        data.append('number', Phone);

        const response = await fetch(URLs.api_base_url + "_send_otp.php", {
          method: "POST",
          body: data
        })
        const responseJson = await response.json();
        if (responseJson.status != "success") {
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Some problems occured while sending OTP. (Server Error)'
          });
          return;
        }

        console.log(responseJson.otp)
        setSystemOTP(responseJson.otp);
        setOTPModal(true);
        Toast.show({
          type: 'success',
          text1: 'Done!',
          text2: 'OTP sent successfully'
        });

      } catch (error) {
        console.log(error);
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'Some problems occured while sending OTP. Please try again'
        });
      } finally {
        SetPageLoading(false);
      }
    }
  }

  useEffect(() => {
    permisionFunction();
    return () => { }
  }, [])


  const isFocused = useIsFocused();

  useEffect(() => {
    SetPageLoading(false);
    SetPageError(false);

    return () => { }
  }, [isFocused])


  return (
    <View>
      <LoadingIndicator text={loadingText} visible={loading} />
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
          paddingVertical: verticalScale(10),
        }}>
          <CameraView
            ref={(ref: any) => setCamera(ref)}
            style={{
              width: '100%',
              height: '80%',
              borderRadius: moderateScale(10),

            }}
            // @ts-ignore
            autoFocus={'on'}
          />
          <View style={styles.clickBtnOuterContainer}>
            <TouchableOpacity style={styles.clickBtn}>
              <TouchableOpacity onPress={() => captureAndStoreImage()} style={styles.clickBtnInner}></TouchableOpacity>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal
        transparent={true}
        animationType="fade"
        visible={otpModal}
        onRequestClose={() => {
          setOTPModal(!otpModal);
        }}
      >
        <View
          style={{
            backgroundColor: 'rgba(0,0,0,.6)',
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <View style={{
            width: '90%',
            paddingHorizontal: horizontalScale(15),
            paddingVertical: verticalScale(15),
            backgroundColor: '#fff',
            borderRadius: moderateScale(10)
          }}>
            <Text style={{
              fontWeight: 'bold',
              fontSize: moderateScale(16),
              includeFontPadding: false,
              textAlignVertical: 'center'
            }}>
              Enter OTP
            </Text>
            <View style={{
              width: '100%',
              height: 1,
              backgroundColor: 'rgba(0,0,0,0.2)',
              marginVertical: verticalScale(12),
            }}></View>
            <TextInput
              containerStyle={{
                backgroundColor: 'rgba(0,0,0,.08)'
              }}
              keyboardType='number-pad'
              placeholder="Enter OTP"
              value={OTP as string}
              onChangeText={(val) => SetOTP(val)}
            />
            <View style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Button
                onPress={() => VerifyOTP()}
                style={{
                  marginTop: verticalScale(15),
                  paddingHorizontal: horizontalScale(30)
                }}
                text='Verify'
                status='info'
              />
            </View>
          </View>
        </View>
      </Modal>
      <KeyboardAwareScrollView style={styles.scrollView}>
        <View style={styles.inputHolder}>
          <View>
            <View>
              <ThemedText style={styles.remarkText}>
                Name / नाम
              </ThemedText>
              <TextInput
                placeholder="Enter your name / नाम लिखें"
                value={Name}
                onChangeText={(val) => SetName(val)}
              />
            </View>
            <View>
              <ThemedText style={styles.remarkText}>
                Mobile number / मोबाइल नंबर
              </ThemedText>
              <TextInput
                placeholder="Enter your mobile number / मोबाइल नंबर लिखें"
                value={Phone}
                keyboardType='number-pad'
                onChangeText={(val) => SetPhone(val)}
              />
            </View>
            <View style={[styles.captureImageBox, {
              marginTop: verticalScale(10)
            }]}>
              <ThemedText style={styles.imageText}>
                नई आग की फोटो खीचें
              </ThemedText>
              <Image
                // @ts-ignore
                source={{ uri: storedImagePath ? storedImagePath : null }}
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
            <ThemedText type='defaultSemiBold' style={styles.imageText}>
              Remark / टिप्पणी
            </ThemedText>
            <TextInput
              placeholder="Enter your text / टिप्पणी लिखें"
              value={Remark}
              onChangeText={(val) => SetRemark(val)}
            />
          </View>
          <View style={styles.submitBtnHolder}>
            <Button
              onPress={() => sendOTP()}
              textStyle={styles.submitBtn} text='Report fire \ वनाग्नि की सूचना दें' status='info' />
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  )
}

export default NewFireIncidentPublic

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
    marginTop: verticalScale(-5)
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
    marginVertical: verticalScale(10),
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