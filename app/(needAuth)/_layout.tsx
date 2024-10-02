import { Stack } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import Color from '@/utils/Color';
import { StatusBar } from 'expo-status-bar';
import { Image, Text } from 'react-native';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

export default function TabLayout() {

  return (
    <>
      <Stack>
        <Stack.Screen name="index"
          options={{
            headerTitle: 'Forest Fire Uttarakhand',
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
                borderRadius: moderateScale(10)
              }}
              source={require(`../../assets/images/icon.png`)} />
          }}
        />
      </Stack>
      <StatusBar style='light' />
    </>
  );
}
