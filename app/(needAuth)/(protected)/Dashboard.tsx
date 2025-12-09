import React, { useCallback } from 'react'
import { useFocusEffect } from 'expo-router';
import { Alert, BackHandler, StyleSheet, View } from 'react-native'

import MapAndStatsHolder from '@/components/designs/dashboard/MapAndStatsHolder';
import BottomButtonHolder from '@/components/designs/dashboard/BottomButtonHolder';
import DashboardUserInformation from '@/components/designs/dashboard/DashboardUserInformation';

const Dashboard = () => {

  useFocusEffect(
    useCallback(() => {
      const onBackPress = (): boolean => {
        Alert.alert("Hold on!", "Are you sure you want to go back?", [
          {
            text: "Cancel",
            onPress: () => null,
            style: "cancel",
          },
          { text: "YES", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const subsription = BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        subsription.remove();
    }, [])
  );

  return (
    <View style={styles.outerContainer}>

      <DashboardUserInformation />
      <MapAndStatsHolder />
      <BottomButtonHolder />

    </View>
  )
}

export default Dashboard

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  }
})