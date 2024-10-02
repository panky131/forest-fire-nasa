import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { TextInput, themeColor, Picker } from 'react-native-rapi-ui'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import * as SecureStore from 'expo-secure-store';

import { useIsFocused } from '@react-navigation/native'

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import LoadingIndicator from '@/components/designs/LoadingIndicator'
import URLs from '@/utils/URLs'
import { useAuth } from '@/hooks/useAuth'
import { ThemedText } from '@/components/ThemedText'
import Toast from 'react-native-toast-message'
import Color from '@/utils/Color'

interface VillageType {
  name: string,
  label: string
}

const VolunteerLogin = () => {

  const { login } = useAuth();

  // page states
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [PageError, SetPageError] = useState<boolean>(false);

  // input states
  const [name, setName] = useState("");
  const [number, setNumber] = useState("");
  const [villageID, setVillageID] = useState("");
  const [otp, setOTPCode] = useState("");
  const [divisonName, setDivisonName] = useState("");

  // data states
  const [VillageName, SetVillageName] = useState<VillageType[]>([]);
  const [DivisionList, SetDivisonList] = useState([]);

  const handleLogin = async () => {

    // all inputs must be required
    // if (!name || !number || !villageID || !otp) return;
    if (!name || !number || !otp) return;
    try {
      setIsLoading(true);
      SetPageError(false);

      const formData = new FormData();
      formData.append('name', name);
      formData.append('number', number);
      formData.append('villageID', '0'); // Do not remove this paramter. This required for auth
      formData.append('user_type', "volunteer");
      formData.append('OTPCode', otp);
      formData.append('officeName', divisonName);
      const response = await fetch(URLs.api_base_url + "_user_login.php", {
        method: "POST",
        body: formData,
      });


      const responseJson = await response.json();
      if (responseJson.status != "success") {
        // SetPageError(true);
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: responseJson.message,
        });
        console.log(responseJson.message);
        return;
      }

      const _auth_key = responseJson.authKey.toString();
      const _mobile = responseJson.mobile.toString();
      const _user_name = responseJson.name.toString();
      const _user_type = responseJson.user_type.toString();
      const _lat = responseJson.latitude.toString();
      const _long = responseJson.longitude.toString();

      let tempDivision = divisonName.toString();

      await SecureStore.setItemAsync('auth_key', _auth_key);
      await SecureStore.setItemAsync('mobile_number', _mobile);
      await SecureStore.setItemAsync('user_type', _user_type);
      await SecureStore.setItemAsync('user_name', _user_name);
      await SecureStore.setItemAsync('latitude', _lat);
      await SecureStore.setItemAsync('longitude', _long);
      await SecureStore.setItemAsync('division_id', tempDivision);

      login();

    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      setIsLoading(false);
    }
  }

  // funtion to get villages list
  const getVillageName = async () => {
    try {
      setIsLoading(true);

      SetPageError(false);

      const response = await fetch(URLs.api_base_url + "_get_villages_list.php", {
        method: "POST",
      });


      const responseJson = await response.json();
      if (responseJson.status != "success") {
        SetPageError(true);
        return;
      }
      const selectedRangeVillages = responseJson.villages;
      const uniqueVillagesMap = selectedRangeVillages.reduce((acc: any, village: any) => {
        if (!acc.has(village.label)) {
          acc.set(village.label, village);
        }
        return acc;
      }, new Map());

      // Extract unique villages from the map
      const uniqueVillages: VillageType[] = Array.from(uniqueVillagesMap.values()).map(village => ({
        label: village.label,
        value: village.label
      }));
      SetVillageName(uniqueVillages);


    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      setIsLoading(false);
    }
  }

  const getDivisions = async () => {
    try {
      setIsLoading(true);
      SetPageError(false);

      const response = await fetch(URLs.api_base_url + "_get_positions_list.php", {
        method: "GET",
      });

      const responseJson = await response.json();
      if (responseJson.status != "success") {
        SetPageError(true);
        return;
      }
      SetDivisonList(responseJson.divisionList);


    } catch (error) {

      console.log("err" + error);
      SetPageError(true);

    } finally {
      setIsLoading(false);
    }
  }

  const isFocused = useIsFocused();

  useEffect(() => {

    getVillageName();
    getDivisions();

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
              items={DivisionList}
              value={divisonName}
              placeholder="Choose your division"
              onValueChange={(val) => setDivisonName(val)}
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