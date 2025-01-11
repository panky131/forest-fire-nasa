import React from 'react'
import { StyleSheet } from 'react-native'

import DashboardStats from './DashboardStats'
import MapComponent from './MapComponent'

const MapAndStatsHolder = () => {
  return (
    <>
      <DashboardStats />
      <MapComponent />
    </>
  )
}

export default MapAndStatsHolder

const styles = StyleSheet.create({})