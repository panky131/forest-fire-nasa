import React from 'react'
import { StyleSheet, View } from 'react-native'

import MapComponent from '@/components/designs/dashboard/MapComponent';
import DashboardStats from '@/components/designs/dashboard/DashboardStats';
import BottomButtonHolder from '@/components/designs/dashboard/BottomButtonHolder';
import DashboardUserInformation from '@/components/designs/dashboard/DashboardUserInformation';

const Dashboard = () => {
  return (
    <View style={styles.outerContainer}>

      <DashboardUserInformation />

      <DashboardStats />

      <MapComponent />

      <BottomButtonHolder />

    </View >
  )
}

export default Dashboard

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  }
})