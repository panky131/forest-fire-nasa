import React from 'react'
import { router } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import { ThemedText } from '@/components/ThemedText'


interface ButtonProps {
  text: string;
  style?: object;
  size?: 'sm' | 'md' | 'lg';
  status?: 'warning' | 'info';
  textStyle?: object;
  onPress?: () => void;
  bgColor?: string
}


const BottomButtonHolder = () => {
  const Button = ({ text, style, textStyle, onPress }: ButtonProps) => {
    return (
      <View style={[styles.bottomButton, style]}>
        <ThemedText
          style={[styles.buttonText, textStyle]}
          onPress={onPress}
        >
          {text}
        </ThemedText>
      </View>
    )
  }

  return (
    <View style={styles.bottomBtnHolder}>
      <Button
        style={{
          backgroundColor: '#e63946',
        }}
        text='नयी आग की सूचना दे / Report New Fire Incident'
        onPress={() => router.push('/NewFireIncident')}
      />
      <Button
        style={{
          backgroundColor: '#0077b6'
        }}
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
    paddingVertical: verticalScale(8),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
    backgroundColor: '#fff'
  },
  bottomButton: {
    flexBasis: '45%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: verticalScale(5),
    paddingHorizontal: horizontalScale(10),
    borderRadius: moderateScale(10),
    backgroundColor: '#0077b6',
  },
  buttonText: {
    color: '#fff',
    fontSize: moderateScale(12),
    textAlign: 'center',
    lineHeight: verticalScale(16),
    fontWeight: 'semibold',
  }
})