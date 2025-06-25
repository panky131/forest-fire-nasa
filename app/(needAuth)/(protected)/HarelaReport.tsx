import React, { useEffect, useState } from 'react';
import * as Location from 'expo-location';
import { Image, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';
import AreaBurntInput from '@/components/designs/ExistingFireReport/AreaBurntInput';
import AskUserForImage from '@/components/designs/NotAFire/NotAFireMCR/AskUserForImage';
import SubmitReportButton from '@/components/designs/ExistingFireReport/SubmitReportButton';
import HarelaCategorySelect from '@/components/designs/ExistingFireReport/HarelaCategorySelect';
import SelectImageButtonHolder from '@/components/designs/NotAFire/NotAFireMCR/SelectImageButtonHolder';
import Toast from 'react-native-toast-message';
import { haversine } from '@/components/designs/dashboard/_subComponents/CommonUtilsFuntions';
import { useIsFocused } from '@react-navigation/native';
import { ThemedText } from '@/components/ThemedText';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { themeColor } from 'react-native-rapi-ui';

const HarelaReport = () => {

  const params = useLocalSearchParams();
  const { alert_id, lat, lng } = params;

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [areaBurntValue, setAreaBurntValue] = useState<string>('');
  const [pickedImage, setPickedImage] = useState<string | undefined>('');
  const [doesUserHasImage, setDoesUserHasImage] = useState<boolean>(false);
  const [selectedFireCategory, setSelectedFireCategory] = useState<string>('');
  // const [distanceDifference, setDistanceDifference] = useState<boolean | number>(false);

  const SelectImage = (): React.JSX.Element => {
    return (
      <>
        <PickedImageHolder pickedImage={pickedImage} />
        <SelectImageButtonHolder setPickedImage={setPickedImage} />
      </>
    )
  }

  const calculateDistanceDifference = async (lat2: number, long2: number) => {

    try {
      console.log('Check distance started');
      const lat1 = lat;
      const long1 = lng;

      const distance_meters = haversine(lat1 as any, long1 as any, lat2, long2);
      // setDistanceDifference(distance_meters);

    } catch (error) {
      console.log(error)
    }
  }

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

  const permissionFunction = async () => {
    try {
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

  const checkPermissions = async () => {
    await permissionFunction();
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    //setDistanceDifference(0);
    checkPermissions();

  }, [isFocused])

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
      <KeyboardAwareScrollView style={styles.scrollView}>

        <AskUserForImage
          setPickedImage={setPickedImage}
          doesUserHasImage={doesUserHasImage}
          setDoesUserHasImage={setDoesUserHasImage} />

        {doesUserHasImage && <SelectImage />}

        <HarelaCategorySelect
          selectedFireCategory={selectedFireCategory}
          setSelectedFireCategory={setSelectedFireCategory}
        />

        {selectedFireCategory === 'ForestFire' &&
          <AreaBurntInput
            areaBurntValue={areaBurntValue}
            setAreaBurntValue={setAreaBurntValue}
          />}

        <SubmitReportButton
          setSelectedFireCategory={setSelectedFireCategory}
          setAreaBurntValue={setAreaBurntValue}
          setPickedImage={setPickedImage}
          alert_id={alert_id}
          pickedImage={pickedImage}
          areaBurnt={areaBurntValue}
          setLoadingText={setLoadingText}
          setPageLoading={setPageLoading}
          fireCategory={selectedFireCategory}
        />

      </KeyboardAwareScrollView>
    </View>
  )
}

export default HarelaReport

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
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