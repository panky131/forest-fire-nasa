import { StyleSheet } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import React, { useEffect, useState } from 'react';

import { useAuth } from '@/hooks/useAuth';
import { ThemedView } from '@/components/ThemedView'
import { ThemedText } from '@/components/ThemedText';
import { useIsFocused } from '@react-navigation/native';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

const DashboardUserInformation = () => {
  const { authUserData }: any = useAuth();
  const [organizationId, setOragranizationId] = useState<string>('0');

  const getOrganizationId = async () => {
    const storedOrgId = await SecureStore.getItemAsync('organizationId');
    if (storedOrgId) setOragranizationId(storedOrgId);
  }

  const isFocused = useIsFocused();

  useEffect(() => {
    getOrganizationId();

    return () => { }
  }, [isFocused])

  return (
    <ThemedView style={styles.informationHolder}>
      <ThemedText>
        <ThemedText style={styles.welcomeText}>
          Welcome,{' '}
        </ThemedText>
        <ThemedText type='defaultSemiBold' style={styles.userInformationText}>
          {authUserData.user_name} {' '}
          {
            organizationId === '2' &&
            <ThemedText style={styles.oragnizationNameText}>
              (The Hans Foundation)
            </ThemedText>
          }
        </ThemedText>
      </ThemedText>
    </ThemedView>
  )
}

export default DashboardUserInformation

const styles = StyleSheet.create({
  welcomeText: {
    fontSize: moderateScale(12),
    color: '#333'
  },
  informationHolder: {
    paddingHorizontal: horizontalScale(20),
    paddingTop: verticalScale(10),
    backgroundColor: '#fff'
  },
  userInformationText: {
    fontSize: moderateScale(15),
  },
  oragnizationNameText: {
    fontSize: moderateScale(15),
    color: '#000'
  }
})