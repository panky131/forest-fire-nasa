import React, { LegacyRef, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';

import { useAuth } from '@/hooks/useAuth';
import { horizontalScale, verticalScale } from '@/utils/Metrics';

const FreeFire = () => {
  const mapRef: LegacyRef<MapView> | undefined = useRef<MapView | null>(null);
  const { authUserData }: any = useAuth();
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
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          mapType='standard'
          initialRegion={{
            latitude: parseFloat(authUserData.latitude),
            longitude: parseFloat(authUserData.longitude),
            latitudeDelta: 4.0,
            longitudeDelta: 4.0,
          }}
          style={styles.map}
        >
        </MapView>
      )}
    </View>
  );
};

export default FreeFire;

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10)
  },
  map: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
    overflow: 'hidden'
  }
});
