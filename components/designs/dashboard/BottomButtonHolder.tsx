import React from 'react'
import { router } from 'expo-router'
import { Button } from 'react-native-rapi-ui'
import { StyleSheet, View } from 'react-native'
import { horizontalScale, verticalScale } from '@/utils/Metrics'

const BottomButtonHolder = () => {
  return (
    <View style={styles.bottomBtnHolder}>
      <Button
        size='sm'
        status='warning'
        textStyle={{ color: 'rgba(0,0,0,.6)' }}
        text='नयी आग की सूचना दे / Report New Fire Incident'
        onPress={() => router.push('/NewFireIncident')}
      />
      <Button
        size='sm'
        status='info'
        text='कंट्रोल रूम से संपर्क करे / Contact Control Room'
        onPress={() => router.push('/ControllRoomInformation')}
      />
    </View>
  )
}

export default BottomButtonHolder

const styles = StyleSheet.create({
  bottomBtnHolder: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
    backgroundColor: '#fff'
  },
})