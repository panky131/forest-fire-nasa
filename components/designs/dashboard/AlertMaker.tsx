// AlertMarker.tsx
import React, { useRef, useState } from "react";
import { Marker, Callout, LatLng } from "react-native-maps";
import { Image } from "expo-image";
import type { PropsWithChildren } from "react";

interface AlertMarkerProps extends PropsWithChildren {
  coordinate: LatLng;
  icon: number; // require()
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
      tracksViewChanges={!loaded}
      onPress={onPressCallout}
    >
      <Image
        source={icon}
        style={{ width: 35, height: 35 }}
        onLoadEnd={onLoadEnd}
      />

      {children}
    </Marker>
  );
};
