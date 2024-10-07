import { Stack } from 'expo-router';
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'react-native';

import Color from '@/utils/Color';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

export default function RootLayout() {

  return (
    <>
      <Stack screenOptions={{
        headerTitleStyle: {
          fontFamily: 'NotoSans_SemiBold',
          color: '#fff',
          fontSize: moderateScale(16)
        },
        headerStyle: {
          backgroundColor: Color.SpashScreenText,
        },
        headerLeft: () => <Image
          style={{
            width: horizontalScale(40),
            height: verticalScale(40),
            marginRight: horizontalScale(10),
            borderRadius: moderateScale(10),
          }}
          source={require(`../../assets/images/icon.png`)} />,
        headerBackVisible: true,
        headerTintColor: '#fff'
      }}>
        <Stack.Screen name="index"
          options={{
            headerTitle: 'Loading',
            headerShown: false
          }}
        />
        <Stack.Screen options={{
          headerShown: false
        }} name="(protected)" />
        <Stack.Screen name="UserSelect"
          options={{
            headerTitle: 'Forest Fire Uttarakhand',
          }}
        />
        <Stack.Screen name="VolunteerLogin"
          options={{
            headerTitle: 'Volunteer Login',
          }}
        />
        <Stack.Screen name="OfficeStaffLogin"
          options={{
            headerTitle: 'Office Staff Login',
          }}
        />
        <Stack.Screen name="NewFireIncidentPublic"
          options={{
            headerTitle: 'New Fire Incident',
          }}
        />
      </Stack>
      <StatusBar style='dark' />
    </>
  );
}
