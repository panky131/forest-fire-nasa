import { router } from 'expo-router';
import * as Device from "expo-device";
import Constants from "expo-constants";
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import * as Notifications from "expo-notifications";
import { TextInput, Picker } from 'react-native-rapi-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, TouchableOpacity, View, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import URLs from '@/utils/URLs';
import Color from '@/utils/Color';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { useIsFocused } from '@react-navigation/native';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

interface SelectItem {
  label: string,
  value: string;
}

const RevenueStaffLogin = () => {
  const { login }: any = useAuth();

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading');

  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [positionName, setpositionName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [otp, setOTPCode] = useState("");

  const [notificationToken, setNotificationToken] = useState<string>('');
  const [positionList, setPositionList] = useState<SelectItem[]>([]);
  const [districts, setDistricts] = useState<SelectItem[]>([]);

  const navigateToErrorScreen = () => {
    router.replace("/(needAuth)/ErrorScreen");
  };

  const registerForPushNotificationsAsync = async (): Promise<string> => {
    try {
      setPageLoading(true);
      setLoadingText('Getting notification token');
      let token: string = '';

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Failed to get push token for push notification!',
          });
          return '';
        }
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Project ID not found',
          });
          console.log('Project ID not found');
          return "";
        }

        token = (await Notifications.getExpoPushTokenAsync({
          projectId
        })).data;
        console.log(token);
      } else {
        alert('Must use physical device for Push Notifications');
      }

      return token;
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Problems while getting notification token'
      });
      console.log(`Problems while getting notification token`);
      return "";
    } finally {
      setPageLoading(false);
      setLoadingText('Loading');
    }
  };

  const handleLogin = async () => {

    if (!name || !number || !positionName || !otp || !districtName) {
      Toast.show({
        type: 'error',
        text1: 'Oops !',
        text2: 'All input field must be filled out'
      });
      return;
    }

    try {
      setPageLoading(true);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('number', number);
      formData.append('positionName', positionName);
      formData.append('district', districtName);
      formData.append('user_type', "SDRF");
      formData.append('OTPCode', otp);
      formData.append('notificationToken', notificationToken);

      const response = await fetch(URLs.api_base_url + "user_login.php", {
        method: "POST",
        body: formData,
        cache: 'no-cache'
      });

      const responseJson = await response.json();
      if (responseJson.status != "success") {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: responseJson.message
        });
        return;
      }

      const divisonId: string = districtName.toString();
      const _mobile: string = responseJson.mobile.toString();
      const _user_name: string = responseJson.name.toString();
      const _auth_key: string = responseJson.authKey.toString();
      const _user_type: string = responseJson.user_type.toString();
      const _lat: string = responseJson.latitude ? responseJson.latitude.toString() : "30.3165";
      const _long: string = responseJson.longitude ? responseJson.longitude.toString() : "78.0322";

      await SecureStore.setItemAsync('latitude', _lat);
      await SecureStore.setItemAsync('longitude', _long);
      await SecureStore.setItemAsync('auth_key', _auth_key);
      await SecureStore.setItemAsync('user_type', _user_type);
      await SecureStore.setItemAsync('user_name', _user_name);
      await SecureStore.setItemAsync('mobile_number', _mobile);
      await SecureStore.setItemAsync('division_id', divisonId);

      login();
      router.replace('/');

    } catch (error) {

      console.log(error);
      navigateToErrorScreen();

    } finally {
      setPageLoading(false);
    }
  };

  const getNotificationToken = async () => {
    const notificationToken = await registerForPushNotificationsAsync();
    setNotificationToken(notificationToken);
    console.log('This is new notification token-', notificationToken);
  };

  const getAllPositions = async () => {
    try {

      setPageLoading(true);
      const apiUrl: string = URLs.api_base_url + "login/fetchRevenueStaffLoginPositions.php";

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      if (response.status !== 200) {
        navigateToErrorScreen();
        return;
      }

      const responseJson = await response.json();
      if (responseJson.status !== "success") {
        navigateToErrorScreen();
        return;
      }

      const postions: string[] = responseJson.positions;
      const sdrfPositionsList: SelectItem[] = postions.map(position => ({ label: position, value: position }));
      setPositionList(sdrfPositionsList);

    } catch (error) {

      console.log(error);
      navigateToErrorScreen();

    } finally {
      setPageLoading(false);
      getNotificationToken();
    }
  };

  const getDistricts = async () => {
    try {

      setPageLoading(true);
      const apiUrl: string = URLs.api_base_url + "_get_districts.php?app_token=nothing";

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      if (response.status !== 200) {
        navigateToErrorScreen();
        return;
      }

      const responseJson: string[] = await response.json();

      const mappedDistrict: SelectItem[] = responseJson.map(district => ({ label: district, value: district }));
      setDistricts(mappedDistrict);

    } catch (error) {

      console.log(error);
      navigateToErrorScreen();

    } finally {
      setPageLoading(false);
      getNotificationToken();
    }
  };

  const isFocused = useIsFocused();

  useEffect(() => {

    getAllPositions();
    getDistricts();

    return () => { };
  }, [isFocused]);


  return (
    <SafeAreaView>
      <LoadingIndicator
        text={loadingText}
        visible={pageLoading}
      />
      <KeyboardAwareScrollView>
        <View style={styles.detailsHolder}>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              जिले का नाम / District Name
            </ThemedText>
            <Picker
              items={districts}
              value={districtName}
              placeholder="Choose your district"
              onValueChange={(val) => setDistrictName(val)}
            />
          </View>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              नाम / Name
            </ThemedText>
            <TextInput
              placeholder={"Eg. John Doe"}
              value={name}
              onChangeText={setName}
            />
          </View>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              मोबाइल नंबर / Mobile No
            </ThemedText>
            <TextInput
              keyboardType='numeric'
              value={number}
              placeholder={"Eg. 9876543210"}
              onChangeText={setNumber}
            />
          </View>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              अपना पद चुनें / Choose Your Designation
            </ThemedText>
            <Picker
              items={positionList}
              value={positionName}
              placeholder="Choose your designation"
              onValueChange={(val) => setpositionName(val)}
            />
          </View>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              OTP code (वन विभाग द्वारा प्रदान किया गया लॉगिन कोड)
            </ThemedText>
            <TextInput
              value={otp}
              keyboardType='numeric'
              placeholder={"Eg. *****"}
              onChangeText={setOTPCode}
            />
          </View>

          <View style={styles.bottomBtnContainer}>
            <TouchableOpacity
              onPress={() => handleLogin()}
              style={styles.btnOp}>
              <ThemedText type='default' style={styles.btnText}>
                Next / आगे बढ़ें
              </ThemedText>
            </TouchableOpacity>
          </View>

        </View>
      </KeyboardAwareScrollView>
    </SafeAreaView>
  );
};

export default RevenueStaffLogin;

const styles = StyleSheet.create({
  inputBox: {
    paddingHorizontal: horizontalScale(15),
    marginTop: verticalScale(15)
  },
  inputLabel: {
    marginBottom: verticalScale(5),
    fontSize: moderateScale(18),
    color: Color.SpashScreenText
  },
  detailsHolder: {
    marginTop: verticalScale(-20)
  },
  bottomBtnContainer: {
    marginTop: verticalScale(25),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  btnOp: {
    backgroundColor: Color.SpashScreenText,
    paddingVertical: verticalScale(14),
    borderRadius: moderateScale(100),
    paddingHorizontal: horizontalScale(15),
    width: '90%',
  },
  btnText: {
    color: '#fff',
    fontSize: moderateScale(14),
    textAlign: 'center'
  },
});