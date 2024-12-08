import React from 'react';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText';
import { useAuth } from '@/hooks/useAuth';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

const DashboardUserInformation = () => {
  const { authUserData }: any = useAuth();

  return (
    <ThemedView style={styles.informationHolder}>
      <ThemedText type='title' style={styles.userInformationText}>
        <ThemedText type='defaultSemiBold'>
          Welcome {' '}
        </ThemedText>
        {authUserData.user_name}
      </ThemedText>
    </ThemedView>
  )
}

export default DashboardUserInformation

const styles = StyleSheet.create({
  informationHolder: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(10),
    backgroundColor: '#fff'
  },
  userInformationText: {
    fontSize: moderateScale(18)
  }
})