import React, { useEffect } from 'react'
import Toast from 'react-native-toast-message';
import { Router, useRouter } from 'expo-router';
import { ActivityIndicator, View } from 'react-native'
import { useIsFocused } from '@react-navigation/native';

import Color from '@/utils/Color';
import * as SecureStore from 'expo-secure-store';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

const Logout = () => {

  const router: Router = useRouter();
  const isFocused = useIsFocused();

  const logOut = async () => {
    await SecureStore.deleteItemAsync('auth_key');
    await SecureStore.deleteItemAsync('mobile_number');
    await SecureStore.deleteItemAsync('user_type');
    await SecureStore.deleteItemAsync('user_name');
    await SecureStore.deleteItemAsync('latitude');
    await SecureStore.deleteItemAsync('longitude');
    await SecureStore.deleteItemAsync('division_id');

    router.push("/");
  }

  useEffect(() => {

    logOut();
    Toast.show({
      type: 'success',
      text1: 'Done!',
      text2: 'Logged out successfully..',
    });

    return () => {

    }
  }, [isFocused])


  return (
    <View style={{
      paddingHorizontal: horizontalScale(20),
      paddingVertical: verticalScale(20)
    }}>
      <View style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: verticalScale(1),
        backgroundColor: '#fff',
        paddingHorizontal: horizontalScale(20),
        paddingVertical: verticalScale(20)
      }}>
        <ActivityIndicator size={'large'} />
        <ThemedText type='defaultSemiBold' style={{
          textAlign: 'center',
          marginVertical: verticalScale(10),
          fontSize: moderateScale(15),
          color: Color.SpashScreenText,
        }}>
          Please wait.. while we are logging you out
        </ThemedText>
      </View>
    </View>
  )
}

export default Logout