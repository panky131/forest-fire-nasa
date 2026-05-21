import React, { useEffect, useRef, useState } from "react";
import { StyleSheet, Platform } from "react-native";
import { Marker, LatLng } from "react-native-maps";
import { Image } from "expo-image";
import type { PropsWithChildren } from "react";

import { moderateScale } from "@/utils/Metrics";

/** Fire-point markers — smaller than legacy size but same bitmap assets. */
const FIRE_ICON_SIZE = moderateScale(22);

interface AlertMarkerProps extends PropsWithChildren {
  coordinate: LatLng;
  icon: number;
  onPressCallout?: () => void;
}

export const AlertMarker = ({
  coordinate,
  icon,
  children,
  onPressCallout,
}: AlertMarkerProps) => {
  const markerRef = useRef<React.ElementRef<typeof Marker> | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => markerRef.current?.redraw?.(), 80);
    return () => clearTimeout(t);
  }, [icon]);

  const onLoadEnd = () => {
    if (!loaded) {
      setLoaded(true);
      markerRef.current?.redraw?.();
    }
  };

  return (
    <Marker
      ref={markerRef}
      coordinate={coordinate}
      anchor={{ x: 0.5, y: 0.92 }}
      tracksViewChanges={!loaded}
      onPress={onPressCallout}
    >
      <Image
        source={icon}
        style={styles.fireIcon}
        contentFit="contain"
        onLoadEnd={onLoadEnd}
        accessibilityLabel="Fire alert"
      />
      {children}
    </Marker>
  );
};

const styles = StyleSheet.create({
  fireIcon: {
    width: FIRE_ICON_SIZE,
    height: FIRE_ICON_SIZE,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 2,
      },
      android: { elevation: 3 },
      default: {},
    }),
  },
});
