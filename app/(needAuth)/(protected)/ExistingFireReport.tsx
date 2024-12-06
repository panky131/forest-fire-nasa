import * as Location from 'expo-location';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';
import { Camera, CameraView } from 'expo-camera';
import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Button, Picker, TextInput, themeColor } from 'react-native-rapi-ui';
import { StyleSheet, Image, View, Modal, TouchableOpacity } from 'react-native';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useIsFocused } from '@react-navigation/native';

import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { tbl_existing_fire_report } from '@/utils/sqlite/SQLiteDBSchema';
import { insertRow } from '@/utils/sqlite/SQLiteFunctions';
import { checkAndUploadData } from '@/tasks/BackgroundTaskHandler';

const NewFireIncident = () => {

  const { authUserData }: any = useAuth();

  const categoryItems = [
    { label: 'Forest Fire', value: 'ForestFire' },
    { label: 'Others', value: 'others' },
  ];

  const params = useLocalSearchParams();
  const { alert_id, lat, lng } = params;

  const [remark, setRemark] = useState<string>('');
  const [categoryValue, setCategoryValue] = useState<string>('');
  const [areaBurntValue, setAreaBurntValue] = useState<string>('');

  const [camera, setCamera] = useState(null);
  const [storedImagePath, setStoredImagePath] = useState<string | null>(null);
  const [distanceDifference, setDistanceDifference] = useState<boolean | number>(false);

  const [loadingText, setLoadingText] = useState<string>('Loading..');
  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  const permissionFunction = async () => {
    try {

      const cameraPermission = await Camera.requestCameraPermissionsAsync();

      const { status } = await Location.requestForegroundPermissionsAsync();

      if (cameraPermission.status !== 'granted' || status !== 'granted') {
        alert('Permission for Camera And Location access needed.');
        return;
      }

      const isLocationEnabled = await Location.hasServicesEnabledAsync();
      if (!isLocationEnabled) {
        alert('Location services are disabled.');
        return;
      }

      isUserLocationValid();
    } catch (error) {
      console.log(error);
    }
  };

  const isUserLocationValid = async () => {
    try {
      setPageLoading(true);
      setLoadingText('Getting your location');

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Highest,
      });

      calculateDistanceDifference(location.coords.latitude, location.coords.longitude);

    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Location service is disabled. Please allow the location.'
      })
    } finally {
      setPageLoading(false);
      setLoadingText('Loading');
    }
  }

  const captureImage = async () => {
    try {
      // @ts-ignore
      const data = await camera?.takePictureAsync(null);

      const documentDirectory = FileSystem.documentDirectory || '';
      const existingFireImgDirectory = documentDirectory + 'existing_report_images/';
      await FileSystem.makeDirectoryAsync(existingFireImgDirectory,
        { intermediates: true });

      const filename: string = `existing_fire_report_${Date.now()}.jpg`;
      const photoPath: string = existingFireImgDirectory + filename;
      await FileSystem.moveAsync({
        from: data.uri,
        to: photoPath,
      });

      setStoredImagePath(photoPath)
      setModalVisible(false);

    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Some problems occured while capturing Image. Please try again later..'
      })

    }
  }

  const takePicture = async () => {
    setModalVisible(true);
  };

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

  const calculateDistanceDifference = async (lat2: number, long2: number) => {

    try {
      console.log('Check distance started');
      let lat1 = lat;
      let long1 = lng;

      const distance_meters = haversine(lat1 as any, long1 as any, lat2, long2);
      setDistanceDifference(distance_meters);

    } catch (error) {
      console.log(error)
    }
  }

  const getFormattedDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const date = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${date} ${hours}:${minutes}:${seconds}`;
  };

  const storeReportInSqliteStorage = async () => {
    try {
      setLoadingText('Uploading');
      setPageLoading(true);

      if (!remark || !storedImagePath || !categoryValue ||
        (categoryValue === 'ForestFire' && !areaBurntValue)) {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'All input fields must be filled out'
        });
        return;
      }

      const timestamp: string = getFormattedDateTime();

      const mobile_number: string = authUserData.mobile_number;

      const insertReportQuery: string = `INSERT INTO ${tbl_existing_fire_report.tbl_name}
       (${[...tbl_existing_fire_report.tbl_struct]}) VALUES
        (${Array(tbl_existing_fire_report.tbl_struct.length).fill('?').join(', ')})`;

      const exisitingReportValues: any[] =
        [null, remark, storedImagePath, alert_id, mobile_number, categoryValue,
          areaBurntValue, timestamp];

      await insertRow({ query: insertReportQuery, values: exisitingReportValues });
      checkAndUploadData();

      Toast.show({
        type: 'success',
        text1: 'Done!',
        text2: 'Report is processed successfully and will be uploaded shortly'
      });

      setRemark('');
      setAreaBurntValue('');
      setCategoryValue('ForestFire');
      setStoredImagePath('');

    } catch (error) {

      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Some problems occured while processing your request. Please try again later'
      });

    } finally {
      setPageLoading(false);
      setLoadingText('Loading');
    }
  }

  const checkPermissions = async () => {
    await permissionFunction();
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    checkPermissions();

  }, [isFocused])


  // if (distanceDifference as number > 100) return (
  //   <View style={styles.invalidLocationContainer}>
  //     <LoadingIndicator text={'Loading'} visible={pageLoading} />
  //     <View style={styles.invalidLocationImgContainer}>
  //       <Image
  //         style={styles.invalidLocationImage}
  //         source={require('../../../assets/images/invalid_location.jpg')}
  //       />
  //     </View>
  //     <ThemedText style={styles.invalidLocationText} type='default'>
  //       You are trying to capture photo from {distanceDifference} meters.
  //       Please capture within 100 meters
  //     </ThemedText>
  //     <TouchableOpacity style={styles.invalidLocationBtn} onPress={() => permissionFunction()}>
  //       <ThemedText style={[styles.invalidLocationText,
  //       {
  //         color: '#fff'
  //       }
  //       ]} type='default'>
  //         Retry
  //       </ThemedText>
  //     </TouchableOpacity>
  //   </View>
  // )

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
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
              <TouchableOpacity
                onPress={() => captureImage()} style={styles.clickBtnInner}>
              </TouchableOpacity>
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
                source={{ uri: storedImagePath ? storedImagePath : null }}
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
              value={remark}
              onChangeText={(val) => setRemark(val)}
            />
          </View>

          <View>
            <ThemedText style={styles.remarkText}>
              Category (It will be dropdown, if it is forest fire then it will ask about area)
            </ThemedText>
            <Picker
              items={categoryItems}
              value={categoryValue}
              placeholder="Choose your role"
              onValueChange={(val: any) => setCategoryValue(val)}
            />
          </View>

          {categoryValue && categoryValue === 'ForestFire' ?
            <View>
              <ThemedText style={styles.remarkText}>
                Area burnt
              </ThemedText>
              <TextInput
                placeholder="Enter your text"
                value={areaBurntValue}
                onChangeText={(val) => setAreaBurntValue(val)}
              />
            </View>
            : ''
          }

          <View style={styles.submitBtnHolder}>
            <Button
              onPress={() => storeReportInSqliteStorage()}
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
    backgroundColor: themeColor.danger600,
    paddingVertical: verticalScale(10),
    borderRadius: moderateScale(100),
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