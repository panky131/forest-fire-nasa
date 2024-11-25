import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system';
import { Camera, CameraView } from 'expo-camera';
import React, { useEffect, useState } from 'react';
import { Button, TextInput, themeColor } from 'react-native-rapi-ui';
import { StyleSheet, Image, View, Modal, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useAuth } from '@/hooks/useAuth'
import { ThemedText } from '@/components/ThemedText'
import { insertRow } from '@/utils/sqlite/SQLiteFunctions';
import { tbl_fire_incidents } from '@/utils/sqlite/SQLiteDBSchema';
import LoadingIndicator from '@/components/designs/LoadingIndicator'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

const NewFireIncident = () => {

  const { authUserData }: any = useAuth();
  const [Remark, SetRemark] = useState("");

  const [loadingText, setLoadingText] = useState<string>("");
  const [camera, setCamera] = useState<any | null>(null);
  const [storedImagePath, setStoredImagePath] = useState<string | null>(null);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);

  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [loading, SetPageLoading] = useState<boolean>(false);

  const permisionFunction = async () => {
    // @ts-ignore
    const cameraPermission = await Camera.requestCameraPermissionsAsync();
    const { status } = await Location.requestForegroundPermissionsAsync();

    if (cameraPermission.status !== 'granted' || status !== 'granted') {

      alert('Permission for Camera And Location access needed.');
      return;

    }

    const location = await Location.getCurrentPositionAsync({});
    setLocation(location);
  };

  const captureImage = async () => {
    try {
      // @ts-ignore
      const data = await camera?.takePictureAsync(null);

      const documentDirectory = FileSystem.documentDirectory || '';
      const inspectImgDirectory = documentDirectory + 'incidents_images/';
      await FileSystem.makeDirectoryAsync(inspectImgDirectory, { intermediates: true });

      const filename: string = `incident_photo_${Date.now()}.jpg`;
      const photoPath: string = inspectImgDirectory + filename;
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

  const storeIncidentSqliteStorage = async () => {
    try {
      setLoadingText('Uploading');
      SetPageLoading(true);

      if (!Remark || !storedImagePath) {
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
        long = 0;

      }

      const name: string = authUserData.user_name;
      const phone: string = authUserData.mobile_number;
      const divisionId: string = authUserData.division_id;

      const insertIncidentQuery = `INSERT INTO ${tbl_fire_incidents.tbl_name} (${[...tbl_fire_incidents.tbl_struct]}) VALUES (${Array(tbl_fire_incidents.tbl_struct.length).fill('?').join(', ')})`;
      const insertIncidentValues: any[] = [null, storedImagePath, Remark, lat, long, phone, 'Fire', name, divisionId];

      await insertRow({ query: insertIncidentQuery, values: insertIncidentValues });

      Toast.show({
        type: 'success',
        text1: 'Done!',
        text2: 'Report is processed successfully and will be uploaded shortly'
      });

      SetRemark("");
      setStoredImagePath("");

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

  useEffect(() => {
    permisionFunction();
    return () => { }
  }, [])

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
              onPress={() => storeIncidentSqliteStorage()}
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