import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';
import { TextInput, Picker } from 'react-native-rapi-ui';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StyleSheet, TouchableOpacity, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useIsFocused } from '@react-navigation/native';

import URLs from '@/utils/URLs';
import Color from '@/utils/Color';
import { useAuth } from '@/hooks/useAuth';
import Toast from 'react-native-toast-message';
import { ThemedText } from '@/components/ThemedText';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { appendNotificationTokenFields } from '@/utils/appendNotificationTokenFormData';
import { apiErrorMessageFromBody, parseApiJsonObject } from '@/utils/parseApiJsonBody';
import { resolveExpoPushTokenForLoginAsync } from '@/utils/registerForExpoPushToken';

interface PickerDataType {
  value: string,
  label: string
}

const VolunteerLogin = () => {

  const router = useRouter();
  const { login }: any = useAuth();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pageError, setPageError] = useState<boolean>(false);

  const [name, setName] = useState<string>("");
  const [otp, setOTPCode] = useState<string>("");
  const [number, setNumber] = useState<string>("");
  const [divisonName, setDivisonName] = useState<string>("");
  const [divisionList, setDivisonList] = useState<PickerDataType[]>([]);
  const [selectedOrganization, setSelectedOrganization] = useState<string>("");
  const [organizationsList, setOrganizationsList] = useState<PickerDataType[]>([]);

  const handleLogin = async () => {

    if (!name || !number || !otp) return;

    try {
      setIsLoading(true);
      setPageError(false);

      const pushToken = await resolveExpoPushTokenForLoginAsync();

      const formData = new FormData();

      formData.append('name', name);
      formData.append('OTPCode', otp);
      formData.append('number', number);
      formData.append('villageID', '0'); // Do not remove this paramter. This required for auth
      formData.append('user_type', "volunteer");
      formData.append('officeName', divisonName);
      formData.append('organizationId', selectedOrganization);
      appendNotificationTokenFields(formData, pushToken);

      const response = await fetch(URLs.api_base_url + "_user_login.php", {
        method: "POST",
        body: formData,
      });

      const rawBody = await response.text();
      const responseJson = parseApiJsonObject(rawBody);
      if (!responseJson) {
        console.warn("[VolunteerLogin] Non-JSON login response", rawBody.slice(0, 500));
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
        const errMsg = apiErrorMessageFromBody(responseJson);
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: errMsg,
        });
        console.log(errMsg);
        return;
      }

      const _divisonId: string = divisonName.toString();
      const _lat: string = String(responseJson.latitude ?? '');
      const _mobile: string = String(responseJson.mobile ?? '');
      const _user_name: string = String(responseJson.name ?? '');
      const _long: string = String(responseJson.longitude ?? '');
      const _auth_key: string = String(responseJson.authKey ?? '');
      const _user_type: string = String(responseJson.user_type ?? '');

      console.log(selectedOrganization);

      await SecureStore.setItemAsync('auth_key', _auth_key);
      await SecureStore.setItemAsync('mobile_number', _mobile);
      await SecureStore.setItemAsync('user_type', _user_type);
      await SecureStore.setItemAsync('user_name', _user_name);
      await SecureStore.setItemAsync('latitude', _lat);
      await SecureStore.setItemAsync('longitude', _long);
      await SecureStore.setItemAsync('division_id', _divisonId);
      await SecureStore.setItemAsync('organizationId', selectedOrganization.toString());

      login();
      router.replace('/');

    } catch (error) {

      console.log(error);
      setPageError(true);

    } finally {
      setIsLoading(false);
    }
  }

  const getDivisonsOrganizations = async () => {
    try {
      setIsLoading(true);
      setPageError(false);

      const apiUrl: string = URLs.api_base_url + "_get_positions_list.php?type=Volunteer";

      const response = await fetch(apiUrl, {
        method: "GET",
      });

      const responseJson = await response.json();

      if (responseJson.status !== "success") {
        setPageError(true);
        return;
      }

      const { divisionList, oraganizationsList } = responseJson;

      const filteredDivisionList = divisionList.filter(({ label }: PickerDataType) =>
        label !== 'FOREST HEAD QUARTER'
      );

      setDivisonList(filteredDivisionList);
      setOrganizationsList(oraganizationsList);

    } catch (error) {

      console.log("err" + error);
      setPageError(true);

    } finally {
      setIsLoading(false);
    }
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    getDivisonsOrganizations();

    return () => { }
  }, [isFocused])


  return (
    <SafeAreaView>

      <LoadingIndicator
        text={'Loading'}
        visible={isLoading}
      />

      <KeyboardAwareScrollView>
        <View style={styles.detailsHolder}>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              प्रभाग का नाम / Division Name
            </ThemedText>
            <Picker
              items={divisionList}
              value={divisonName}
              placeholder="Choose your division"
              onValueChange={(val) => setDivisonName(val)}
            />
          </View>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              संगठन का नाम / Organization Name
            </ThemedText>
            <Picker
              items={organizationsList}
              value={selectedOrganization}
              placeholder="Choose your oraganization"
              onValueChange={(val) => setSelectedOrganization(val)}
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
              OTP code (वन विभाग द्वारा प्रदान किया गया लॉगिन कोड)
            </ThemedText>
            <TextInput
              value={otp}
              keyboardType='numeric'
              placeholder={"Eg. ****"}
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
  )
}

export default VolunteerLogin

const styles = StyleSheet.create({
  inputBox: {
    paddingHorizontal: horizontalScale(15),
    marginTop: verticalScale(15)
  },
  inputLabel: {
    marginBottom: verticalScale(5),
    fontSize: moderateScale(16),
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
})