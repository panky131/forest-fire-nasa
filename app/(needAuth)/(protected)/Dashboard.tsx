import React from 'react'
import { StyleSheet, View } from 'react-native'

import MapAndStatsHolder from '@/components/designs/dashboard/MapAndStatsHolder';
import BottomButtonHolder from '@/components/designs/dashboard/BottomButtonHolder';
import DashboardUserInformation from '@/components/designs/dashboard/DashboardUserInformation';

const Dashboard = () => {
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