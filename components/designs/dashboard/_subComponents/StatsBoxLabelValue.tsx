import React from 'react'
import { StyleSheet, View } from 'react-native'
import { themeColor } from 'react-native-rapi-ui'

import { ThemedText } from '@/components/ThemedText'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

const StatsBoxLabelValue = ({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) => {
  const text =
    value === null || value === undefined ? "—" : String(value);

  return (
    <View style={styles.flex}>
      <ThemedText type='default' style={styles.boxLabel}>
        {label}
      </ThemedText>
      <ThemedText type='default' style={styles.boxValue}>
        {text}
      </ThemedText>
    </View>
  );
};

export default StatsBoxLabelValue

const styles = StyleSheet.create({
  flex: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: horizontalScale(10),
    marginVertical: verticalScale(2)
  },
  boxLabel: {
    color: themeColor.gray400,
    fontSize: moderateScale(12)
  },
  boxValue: {
    fontSize: moderateScale(13),
    color: themeColor.primary500,
    lineHeight: verticalScale(14)
  },
})