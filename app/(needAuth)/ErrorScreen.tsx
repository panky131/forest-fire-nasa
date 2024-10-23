import React from 'react';
import { Router, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

const relativeImageColor = "#FFC803";

const ErrorScreen = () => {

  const router: Router = useRouter();

  const handleRetry = () => router.push('/')

  return (
    <SafeAreaView style={styles.safeAreaView}>
      <Image style={styles.pageFocusImage} source={require('../../assets/images/server_error.jpg')} />
      <ThemedText style={styles.pageLabel} type='defaultSemiBold'>
        Some problems occured ! {'\n'} Please try again
      </ThemedText>
      <TouchableOpacity style={styles.retryBtn} onPress={() => handleRetry()}>
        <ThemedText style={styles.retryBtnText} type='defaultSemiBold'>
          Retry
        </ThemedText>
      </TouchableOpacity>
    </SafeAreaView>
  )
}

export default ErrorScreen

const styles = StyleSheet.create({
  safeAreaView: {
    backgroundColor: '#fff',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  pageFocusImage: {
    width: '100%',
    height: verticalScale(300),
    resizeMode: 'contain',
  },
  pageLabel: {
    fontSize: moderateScale(18),
    marginVertical: verticalScale(5),
    color: '#333',
    textAlign: 'center'
  },
  retryBtn: {
    backgroundColor: relativeImageColor,
    width: horizontalScale(200),
    height: verticalScale(40),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: moderateScale(100),
    marginTop: verticalScale(30)
  },
  retryBtnText: {
    color: 'rgba(0,0,0,.7+8)',
    fontSize: moderateScale(14)
  }
})