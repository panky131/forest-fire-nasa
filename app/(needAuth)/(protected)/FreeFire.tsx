import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { WebView } from 'react-native-webview';

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
    <View style={styles.container}>
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
    </View>
  );
};

export default FreeFire;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000'
  },
  webview: {
    flex: 1
  }
});
