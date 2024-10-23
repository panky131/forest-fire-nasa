import React from 'react';
import PropTypes from 'prop-types';
import { ActivityIndicator, View, Modal, StyleSheet } from 'react-native';

import { ThemedText } from '../ThemedText';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

interface PageProps {
  visible: boolean,
  text: string | null
}

const LoadingIndicator = ({ visible, text }: PageProps) => (
  <Modal visible={visible} animationType="fade" transparent>
    <View style={styles.container}>
      <View style={styles.content}>
        <ActivityIndicator color="#333" size={'large'} />
        <ThemedText type='default' style={styles.loadingText}>
          {text ? text : 'Loading..'}
        </ThemedText>
      </View>
    </View>
  </Modal>
);

LoadingIndicator.propTypes = {
  visible: PropTypes.bool.isRequired
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: horizontalScale(64),
    paddingVertical: verticalScale(30),
    borderRadius: 16,
    gap: verticalScale(10)
  },
  loadingText: {
    color: '#333',
    fontSize: moderateScale(14)
  }
});

export default LoadingIndicator;