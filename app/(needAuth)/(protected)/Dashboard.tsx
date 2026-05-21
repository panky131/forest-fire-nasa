import React, { useCallback } from 'react';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Alert, BackHandler, StyleSheet, View } from 'react-native';

import BottomButtonHolder from '@/components/designs/dashboard/BottomButtonHolder';
import DashboardUserInformation from '@/components/designs/dashboard/DashboardUserInformation';
import MapAndStatsHolder from '@/components/designs/dashboard/MapAndStatsHolder';

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
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.outerContainer}>
      <DashboardUserInformation />
      <View style={styles.mapAndStats}>
        <MapAndStatsHolder />
      </View>
      <BottomButtonHolder />
    </SafeAreaView>
  );
};

export default Dashboard;

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  },
  /** Lets stats + map use all vertical space between header and bottom actions. */
  mapAndStats: {
    flex: 1,
    minHeight: 0,
  },
});