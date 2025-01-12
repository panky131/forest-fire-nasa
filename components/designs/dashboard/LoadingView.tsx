import { ActivityIndicator, StyleSheet, View } from 'react-native'
import React from 'react'
import { verticalScale } from '@/utils/Metrics';

interface LoaderProps {
  style?: object;
  size?: 'small' | 'large';
}

const LoadingView: React.FC<LoaderProps> = ({ style, size = 'large' }) => (
  <View style={[styles.loadingContainer]}>
    <ActivityIndicator
      style={styles.loadingIndicator}
      size={size}
    />
  </View>
);

export default LoadingView

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingIndicator: {
    marginVertical: verticalScale(40),
  },
})