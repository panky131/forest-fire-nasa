import { router } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react'
import { TextInput, Picker } from 'react-native-rapi-ui'
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'

import URLs from '@/utils/URLs'
import Color from '@/utils/Color';
import { useAuth } from '@/hooks/useAuth'
import { ThemedText } from '@/components/ThemedText';
import { useIsFocused } from '@react-navigation/native'
import LoadingIndicator from '@/components/designs/LoadingIndicator'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

const OfficeStaffLogin = () => {

  const { login }: any = useAuth();

  // page states
  const [PageLoading, SetPageLoading] = useState(false);
  const [PageError, SetPageError] = useState(false);

  // input states
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [positionName, setpositionName] = useState("");
  const [officeName, setofficeName] = useState("");
  const [otp, setOTPCode] = useState("");

  // data states
  const [PositionList, SetPositionList] = useState([]);
  const [OfficeList, SetOfficeList] = useState([]);

  const handleLogin = async () => {

    // all inputs must be required
    if (!name || !number || !positionName || !otp || !officeName) return;

    try {
      SetPageLoading(true);
      SetPageError(false);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('number', number);
      formData.append('positionName', positionName);
      formData.append('officeName', officeName);
      formData.append('user_type', "OfficeStaff");
      formData.append('OTPCode', otp);
      const response = await fetch(URLs.api_base_url + "_user_login.php", {
        method: "POST",
        body: formData,
      });

      const responseJson = await response.json();
      if (responseJson.status != "success") {
        // SetPageError(true);
        alert(responseJson.message);
        return;
      }
      console.log('login_info');
      console.log(responseJson)
      // a. inserting fetched credientials into secure store
      // b. navigating to dashboard screen and making useAuth = true

      const divisonId: string = officeName.toString();
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

      login(); // given by auth Context
      router.replace('/');

    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      SetPageLoading(false);
    }
  }

  // funtion to get villages list
  const getAllPositions = async () => {
    try {

      SetPageLoading(true);
      SetPageError(false);

      const apiUrl: string = URLs.api_base_url + "_get_positions_list.php";

      const response = await fetch(apiUrl, {
        method: "POST",
      });

      if (response.status !== 200) {
        SetPageError(true);
        return;
      }

      const responseJson = await response.json();
      SetPositionList(responseJson.positionList);
      SetOfficeList(responseJson.divisionList)


    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      SetPageLoading(false);
    }
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    getAllPositions();

    return () => { }
  }, [isFocused])


  return (
    <SafeAreaView>
      <LoadingIndicator
        text={'Loading'}
        visible={PageLoading}
      />
      <KeyboardAwareScrollView>
        <View style={styles.detailsHolder}>

          <View style={styles.inputBox}>
            <ThemedText type='default' style={styles.inputLabel}>
              प्रभाग का नाम / Division Name
            </ThemedText>
            <Picker
              items={OfficeList}
              value={officeName}
              placeholder="Choose your division"
              onValueChange={(val) => setofficeName(val)}
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
              items={PositionList}
              value={positionName}
              placeholder="Choose your designation"
              onValueChange={(val) => setpositionName(val)}
            />
          </View>

          {/* <View style={styles.inputBox}>
            <MediumText
              style={styles.inputLabel}
              text={'क्रू स्टेशन का प्रकार'}
            />
            <Picker
              items={PositionList}
              value={positionName}
              placeholder="Choose your crew station type"
              onValueChange={(val) => setpositionName(val)}
            />
          </View> */}

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
  )
}

export default OfficeStaffLogin

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
})