import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { TextInput, Picker } from 'react-native-rapi-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import URLs from '@/utils/URLs';
import Color from '@/utils/Color';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { useIsFocused } from '@react-navigation/native';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { appendNotificationTokenFields } from '@/utils/appendNotificationTokenFormData';
import { apiErrorMessageFromBody, parseApiJsonObject } from '@/utils/parseApiJsonBody';
import { resolveExpoPushTokenForLoginAsync } from '@/utils/registerForExpoPushToken';

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

  const [positionList, setPositionList] = useState<SelectItem[]>([]);
  const [districts, setDistricts] = useState<SelectItem[]>([]);

  const navigateToErrorScreen = () => {
    router.replace("/(needAuth)/ErrorScreen");
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

      const pushToken = await resolveExpoPushTokenForLoginAsync();

      const formData = new FormData();
      formData.append('name', name);
      formData.append('number', number);
      formData.append('positionName', positionName);
      formData.append('district', districtName);
      formData.append('user_type', "RevenueStaff");
      formData.append('OTPCode', otp);
      appendNotificationTokenFields(formData, pushToken);

      const response = await fetch(URLs.api_base_url + "user_login.php", {
        method: "POST",
        body: formData,
        cache: 'no-cache'
      });

      const rawBody = await response.text();
      const responseJson = parseApiJsonObject(rawBody);
      if (!responseJson) {
        console.warn("[RevenueStaffLogin] Non-JSON login response", rawBody.slice(0, 500));
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: response.ok
            ? 'Invalid response from server.'
            : `Server error (HTTP ${response.status}).`,
        });
        return;
      }
      if (String(responseJson.status) !== "success") {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: apiErrorMessageFromBody(responseJson),
        });
        return;
      }

      const divisonId: string = districtName.toString();
      const mobile: string = String(responseJson.mobile ?? '');
      const userName: string = String(responseJson.name ?? '');
      const authKey: string = String(responseJson.authKey ?? '');
      const userType: string = String(responseJson.user_type ?? '');
      const lat: string = responseJson.latitude != null ? String(responseJson.latitude) : "30.3165";
      const long: string = responseJson.longitude != null ? String(responseJson.longitude) : "78.0322";

      await SecureStore.setItemAsync('latitude', lat);
      await SecureStore.setItemAsync('longitude', long);
      await SecureStore.setItemAsync('auth_key', authKey);
      await SecureStore.setItemAsync('user_type', userType);
      await SecureStore.setItemAsync('user_name', userName);
      await SecureStore.setItemAsync('mobile_number', mobile);
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

      const postions: string[] = Array.isArray(responseJson.positions) ? responseJson.positions : [];
      const revenueStaffPositionsList: SelectItem[] = postions.map((position) => ({ label: position, value: position }));
      setPositionList(revenueStaffPositionsList);

    } catch (error) {

      console.log(error);
      navigateToErrorScreen();

    } finally {
      setPageLoading(false);
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

      const responseJson: unknown = await response.json();
      const rawList = Array.isArray(responseJson) ? responseJson : [];
      const mappedDistrict: SelectItem[] = rawList.map((district: string) => ({ label: district, value: district }));
      setDistricts(mappedDistrict);

    } catch (error) {

      console.log(error);
      navigateToErrorScreen();

    } finally {
      setPageLoading(false);
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