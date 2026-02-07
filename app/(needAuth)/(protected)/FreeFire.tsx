import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { SafeAreaView } from 'react-native-safe-area-context';

const MAP_URL = 'https://forestfireuttarakhand.in/admin/pre_fires/index.html';

const FreeFire = () => {
  const [isFocused, setIsFocused] = React.useState(false);

  useFocusEffect(
    React.useCallback(() => {
      setIsFocused(true);
      return () => {
        setIsFocused(false);
      };
    }, [])
  );

  return (
    <SafeAreaView edges={['bottom']} style={styles.container}>
      {isFocused && (
        <WebView
          source={{ uri: MAP_URL }}
          style={styles.webview}
          originWhitelist={['*']}
          javaScriptEnabled
          domStorageEnabled
          startInLoadingState
        />
      )}
    </SafeAreaView>
  );
};

export default FreeFire;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webview: {
    flex: 1
  }
});
