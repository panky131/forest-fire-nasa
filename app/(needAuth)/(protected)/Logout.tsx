import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React, { useEffect } from 'react'
import { useIsFocused } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import Color from '@/utils/Color';

const Logout = () => {

  const isFocused = useIsFocused();
  const { logout } = useAuth();


  useEffect(() => {

    logout();
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

const styles = StyleSheet.create({})