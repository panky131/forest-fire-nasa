import { StyleSheet, TouchableOpacity } from 'react-native';

import Color from '@/utils/Color';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

const SubmitReportButton = () => {
  return (
    <TouchableOpacity>
      <ThemedView style={styles.submitButton}>
        <ThemedText type='defaultSemiBold' style={styles.submitButtonText}>
          Submit Report
        </ThemedText>
      </ThemedView>
    </TouchableOpacity>
  )
}

export default SubmitReportButton

const styles = StyleSheet.create({
  submitButton: {
    marginTop: verticalScale(20),
    width: horizontalScale(250),
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingVertical: verticalScale(12),
    backgroundColor: Color.ComponentColorCyan,
    borderRadius: moderateScale(100)
  },
  submitButtonText: {
    color: '#fff',
    fontSize: moderateScale(12),
    textAlign: 'center'
  }
})