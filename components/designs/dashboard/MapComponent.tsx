import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { themeColor } from 'react-native-rapi-ui';
import { router, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  Touchable,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Callout, PROVIDER_GOOGLE, Region } from 'react-native-maps';

import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

import { AlertMarker } from './AlertMaker';
import { ThemedText } from '@/components/ThemedText';
import DashboardModal from '@/components/models/DashboardModal';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import FilterBtnComponent from './_subComponents/FilterBtnComponent';
import MapAlertCalloutCard from './_subComponents/MapAlertCalloutCard';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { AlertsResponseDataType, CoordinatesType, UserCoordsType } from '@/utils/Types';
import { beatIsNearForest } from '@/utils/functions/nearForestBeat';
import BeatsForestMapOverlay from '@/components/designs/dashboard/BeatsForestMapOverlay';
import { useBeatsForestBoundary } from '@/hooks/useBeatsForestBoundary';
import { isWideForestMapView, getBeatsForestDataSync } from '@/utils/beatsKmz/beatsKmzService';
import { distanceMetersToForestBoundary } from '@/utils/beatsKmz/distanceToForestBoundary';

const NEAR_FOREST_ALERT_ICON = require("../../../assets/images/alert_icon_yellow.png");

const ALERT_ICON_BY_STATUS: Record<string, number> = {
  active: require("../../../assets/images/active_alert_2.png"),
  closed: require("../../../assets/images/closed_alert.png"),
  not_fire: require("../../../assets/images/not_fire.png"),
  being_held: require("../../../assets/images/being_held_alert.png"),
};

function alertMarkerIcon(
  status: string,
  alert: AlertsResponseDataType,
  nearForestMapMode: boolean,
  nearForestActiveOnlyView: boolean
): number {
  const useNearForestIcon =
    nearForestMapMode ||
    nearForestActiveOnlyView ||
    beatIsNearForest(alert.beat);

  if (useNearForestIcon) {
    return NEAR_FOREST_ALERT_ICON;
  }
  return ALERT_ICON_BY_STATUS[status] ?? ALERT_ICON_BY_STATUS.closed;
}

/** User-facing map mode → `react-native-maps` `mapType` (Google provider). */
type MapLayerMode = "normal" | "satellite" | "admin";

const MAP_LAYER_TO_TYPE: Record<MapLayerMode, "standard" | "satellite" | "hybrid"> = {
  normal: "standard",
  satellite: "satellite",
  /** Roads & labels on imagery — practical “admin / ops” view on Google Maps. */
  admin: "hybrid",
};

const MAP_TILES = [
  { mode: "normal" as const, label: "Normal", icon: "map-outline" as const },
  { mode: "satellite" as const, label: "Satellite", icon: "globe-outline" as const },
  { mode: "admin" as const, label: "Admin", icon: "layers-outline" as const },
];

/** Oblique pitch for satellite / hybrid so imagery reads more “3D” (two-finger drag still adjusts). */
const SATELLITE_OBLIQUE_PITCH_DEG = 52;

/** Reserve space so markers aren’t hidden under floating map-type tiles (keep in sync with tray height). */
const MAP_TYPE_FLOAT_PADDING = {
  top: 0,
  right: 0,
  bottom: verticalScale(Platform.OS === "android" ? 54 : 50),
  left: 0,
};

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  fetchAlerts: () => Promise<void>,
  userCoordinates: UserCoordsType | undefined,
  setUserCoordinates: React.Dispatch<React.SetStateAction<UserCoordsType | undefined>>,
  authUserData: any,
  filteredAlertsData: AlertsResponseDataType[],
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>,
  /** Near Forest Alerts screen — markers are already NF-only; enables NF pin styling. */
  nearForestMapMode?: boolean,
}

const MapComponent = (args: ComponentPropType) => {
  const { fetchAlerts, alertsData, filteredAlertsData, setFilteredAlertsData,
    userCoordinates, setUserCoordinates, authUserData, nearForestMapMode = false } = args;

  const Navigation = useNavigation();

  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [whichActiveBtn, setWhichActiveBtn] = useState<string>('all');
  const [selectedFire, setSelectedFire] = useState<AlertsResponseDataType | null>(null);
  const [loadingText, setLoadingText] = useState<string>("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<CoordinatesType>({ lat: 0, lng: 0 });
  const [selectedCalloutTree, setSelectedCalloutTree] = useState<AlertsResponseDataType | null>(null);
  const [mapLayerMode, setMapLayerMode] = useState<MapLayerMode>("satellite");

  const nearForestActiveOnlyView = useMemo(
    () =>
      filteredAlertsData.length > 0 &&
      filteredAlertsData.every(
        (a) => a.status === 'active' && beatIsNearForest(a.beat)
      ),
    [filteredAlertsData]
  );

  const calloutBoundaryDistanceM = useMemo(() => {
    const a = selectedCalloutTree;
    if (!a) return null;
    if (!nearForestMapMode && !beatIsNearForest(a.beat)) return null;
    const forest = getBeatsForestDataSync();
    if (!forest) return null;
    const lat = parseFloat(String(a.lat));
    const lng = parseFloat(String(a.lng));
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
    const m = distanceMetersToForestBoundary(lat, lng, forest.polygons, forest.spatialIndex);
    if (!Number.isFinite(m) || m === Infinity) return null;
    return Math.round(m);
  }, [selectedCalloutTree, nearForestMapMode]);

  const markersOnMap = useMemo(() => {
    const raw = Array.isArray(filteredAlertsData) ? filteredAlertsData : [];
    const scoped = nearForestMapMode
      ? raw
      : raw.filter((a) => !beatIsNearForest(a.beat));
    return scoped.filter(
      (props) =>
        props.lat != null &&
        props.lng != null &&
        String(props.lat).trim() !== '' &&
        String(props.lng).trim() !== '' &&
        !Number.isNaN(parseFloat(String(props.lat))) &&
        !Number.isNaN(parseFloat(String(props.lng)))
    );
  }, [filteredAlertsData, nearForestMapMode]);

  const mapRef = useRef<MapView | null>(null);
  const mapReadyRef = useRef(false);

  const initialMapRegion = useMemo<Region>(
    () => ({
      latitude: parseFloat(authUserData.latitude),
      longitude: parseFloat(authUserData.longitude),
      latitudeDelta: 4.0,
      longitudeDelta: 4.0,
    }),
    [authUserData.latitude, authUserData.longitude]
  );

  const [mapRegion, setMapRegion] = useState<Region | null>(initialMapRegion);
  const { visiblePolygons, onRegionChange } = useBeatsForestBoundary(mapRegion);
  const wideForestView = mapRegion ? isWideForestMapView(mapRegion) : true;

  const applyMapLayerCameraTilt = useCallback(() => {
    const map = mapRef.current;
    if (!map?.getCamera || !mapReadyRef.current) return;

    const fallbackCenter = {
      latitude: parseFloat(String(authUserData.latitude)),
      longitude: parseFloat(String(authUserData.longitude)),
    };
    const wantOblique = mapLayerMode === "satellite" || mapLayerMode === "admin";

    map
      .getCamera()
      .then((cam) => {
        const center = cam.center ?? fallbackCenter;
        const heading = typeof cam.heading === "number" ? cam.heading : 0;
        const zoom =
          typeof cam.zoom === "number" && !Number.isNaN(cam.zoom) ? cam.zoom : 8;
        map.animateCamera(
          {
            center,
            heading,
            pitch: wantOblique ? SATELLITE_OBLIQUE_PITCH_DEG : 0,
            zoom,
          },
          { duration: 700 }
        );
      })
      .catch(() => {
        map.animateCamera(
          {
            center: fallbackCenter,
            heading: 0,
            pitch: wantOblique ? SATELLITE_OBLIQUE_PITCH_DEG : 0,
            zoom: 8,
          },
          { duration: 700 }
        );
      });
  }, [mapLayerMode, authUserData.latitude, authUserData.longitude]);

  const hanldeAlertClick = (alert_id: number, status: string | null, lat: string, lng: string, alert: AlertsResponseDataType): void => {
    if (status === 'closed') return;

    setSelectedCoordinates({ lat: lat, lng: lng });
    setSelectedFire(alert);
    setStatus(status);
    setModalVisible(true);
  };

  const handleMarkerClick = (alert_id: string | number): void => {

    const nextScreenName = authUserData.user_type === 'mcr'
      ? '/ExistingFireReportMCR' : '/ExistingFireReport';

    Alert.alert('Confirm', 'Do you want to close this Fire.?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          router.push({ pathname: nextScreenName, params: { alert_id: alert_id, lat: selectedCoordinates.lat, lng: selectedCoordinates.lng } });
        }
      },
    ]);
  };

  const getUserLocation = async () => {
    try {
      setIsLoading(true);
      setLoadingText("Getting your location");

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Required',
          text2: 'Please allow for location permission'
        });
        return;
      }

      const location = await Location.getCurrentPositionAsync({ accuracy: 2 });

      setUserCoordinates({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

    } catch {
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Unable to get your location. Please try again'
      });
    } finally {
      setIsLoading(false);
      setLoadingText("Loading");
    }
  };

  const initializeMapScreen = async (): Promise<void> => {
    if (!userCoordinates) {
      await getUserLocation();
    }
  };

  const animateToDivision = async () => {
    try {
      const latitude = await SecureStore.getItemAsync('latitude');
      const longitude = await SecureStore.getItemAsync('longitude');

      if (latitude && longitude) {
        const region = {
          latitudeDelta: 3.0,
          longitudeDelta: 3.0,
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
        };

        mapRef.current?.animateToRegion(region, 2000);
      } else {
        console.error('Latitude or longitude not found in SecureStore.');
      }
    } catch (error) {
      console.error('Error retrieving location from SecureStore:', error);
    }
  };

  useEffect(() => {
    initializeMapScreen();
  }, []);

  useEffect(() => {
    animateToDivision();
  }, []);

  useEffect(() => {
    if (!mapReadyRef.current) return;
    const id = setTimeout(() => applyMapLayerCameraTilt(), 220);
    return () => clearTimeout(id);
  }, [mapLayerMode, applyMapLayerCameraTilt]);

  if (pageError) {
    return (
      <View style={styles.errorComponentHolder}>
        <Image style={styles.errorImage} source={require('../../../assets/images/error.jpg')} />
        <ThemedText style={styles.errorLabelText} type='defaultSemiBold'>
          Some problem occured {"\n"} while loading map.
        </ThemedText>
      </View>
    );
  }

  return (
    <View style={styles.mapHolderContainer}>
      <LoadingIndicator text={loadingText} visible={isLoading} />
      <DashboardModal
        // @ts-ignore
        handleMarkerClickFun={handleMarkerClick}
        SelectedFire={selectedFire as AlertsResponseDataType}
        SelectedCoordinates={selectedCoordinates}
        SetModalVisible={setModalVisible}
        visible={modalVisible}
        Navigation={Navigation}
        status={status as string}
        getDataFunction={fetchAlerts}
        authUserData={authUserData}
        SetPageError={setPageError}
        setIsLoading={setIsLoading}
      />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.mapHeaderScrollOuter}
        contentContainerStyle={styles.mapHeaderComponent}
      >
        <FilterBtnComponent
          alertsDataSet={alertsData}
          setAlertsData={setFilteredAlertsData}
          userCoordinates={userCoordinates}
          isActive={whichActiveBtn === 'all' ? true : false}
          btnText='All Alerts'
          rangeInKMToShow={2000}
          setWhichActiveBtn={setWhichActiveBtn}
          isActiveText='all'
        />
        <FilterBtnComponent
          alertsDataSet={alertsData}
          setAlertsData={setFilteredAlertsData}
          userCoordinates={userCoordinates}
          isActive={whichActiveBtn === '1KM' ? true : false}
          btnText='1 Kms'
          rangeInKMToShow={1}
          setWhichActiveBtn={setWhichActiveBtn}
          isActiveText='1KM'
        />

        <FilterBtnComponent
          alertsDataSet={alertsData}
          setAlertsData={setFilteredAlertsData}
          userCoordinates={userCoordinates}
          isActive={whichActiveBtn === '5KM' ? true : false}
          btnText='5 Kms'
          rangeInKMToShow={5}
          setWhichActiveBtn={setWhichActiveBtn}
          isActiveText='5KM'
        />
        <FilterBtnComponent
          alertsDataSet={alertsData}
          setAlertsData={setFilteredAlertsData}
          userCoordinates={userCoordinates}
          isActive={whichActiveBtn === '10KM' ? true : false}
          btnText='10 Kms'
          rangeInKMToShow={10}
          setWhichActiveBtn={setWhichActiveBtn}
          isActiveText='10KM'
        />
      </ScrollView>

      <View style={styles.mapArea}>
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          mapType={MAP_LAYER_TO_TYPE[mapLayerMode]}
          mapPadding={MAP_TYPE_FLOAT_PADDING}
          pitchEnabled
          rotateEnabled
          initialRegion={initialMapRegion}
          onRegionChangeComplete={(region) => {
            setMapRegion(region);
            onRegionChange(region);
          }}
          onMapReady={() => {
            mapReadyRef.current = true;
            setTimeout(() => applyMapLayerCameraTilt(), 120);
          }}
          style={styles.mapFill}
        >
          <BeatsForestMapOverlay polygons={visiblePolygons} wideView={wideForestView} />
          {markersOnMap.map((props: AlertsResponseDataType, index: number) => {
              const coordinate = {
                latitude: parseFloat(props.lat as string),
                longitude: parseFloat(props.lng as string),
              };

              const icon = alertMarkerIcon(
                props.status,
                props,
                nearForestMapMode,
                nearForestActiveOnlyView
              );

              return (
                <AlertMarker
                  key={props.alert_id ?? index}
                  coordinate={coordinate}
                  icon={icon}
                  onPressCallout={() => setSelectedCalloutTree(props)}
                />
              );
            })}
        </MapView>

        <View
          style={styles.mapTypeTilesWrap}
          pointerEvents="box-none"
          collapsable={false}
        >
          <View style={styles.mapTypeTilesTray} accessibilityRole="tablist">
            {MAP_TILES.map(({ mode, label, icon }) => {
              const active = mapLayerMode === mode;
              return (
                <TouchableOpacity
                  key={mode}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  activeOpacity={0.82}
                  onPress={() => setMapLayerMode(mode)}
                  style={[styles.mapTypeTile, active && styles.mapTypeTileActive]}
                >
                  <Ionicons
                    name={icon}
                    size={moderateScale(15)}
                    color={active ? "#fff" : "rgba(255,255,255,0.88)"}
                  />
                  <Text
                    style={[styles.mapTypeTileLabel, active && styles.mapTypeTileLabelActive]}
                    numberOfLines={1}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {selectedCalloutTree ? (
        <View style={styles.calloutOverlay}>
          <Pressable
            style={styles.calloutBackdrop}
            onPress={() => setSelectedCalloutTree(null)}
            accessibilityLabel="Dismiss alert details"
          />
          <View style={styles.calloutSheet} pointerEvents="box-none">
            <MapAlertCalloutCard
              alert={selectedCalloutTree}
              nearForestMapMode={nearForestMapMode}
              boundaryDistanceMetres={calloutBoundaryDistanceM}
              satelliteView={
                mapLayerMode === "satellite" || mapLayerMode === "admin"
              }
              onClose={() => setSelectedCalloutTree(null)}
              onAction={() =>
                hanldeAlertClick(
                  selectedCalloutTree.alert_id,
                  selectedCalloutTree.status,
                  selectedCalloutTree.lat as string,
                  selectedCalloutTree.lng as string,
                  selectedCalloutTree
                )
              }
            />
          </View>
        </View>
      ) : null}

    </View>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
  calloutOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 110,
    elevation: 16,
    justifyContent: 'flex-end',
    paddingBottom: verticalScale(52),
    paddingHorizontal: horizontalScale(8),
  },
  calloutBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.35)',
  },
  calloutSheet: {
    width: '100%',
    alignItems: 'center',
  },
  errorComponentHolder: {
    flex: 1,
    backgroundColor: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: horizontalScale(15)
  },
  errorImage: {
    width: '80%',
    height: verticalScale(240),
    objectFit: 'contain'
  },
  errorLabelText: {
    paddingHorizontal: horizontalScale(10),
    marginVertical: verticalScale(10),
    color: 'red',
    fontSize: moderateScale(16),
    textAlign: 'center'
  },
  outerContainer: {
    flex: 1
  },
  mapHolderContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(10),
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    overflow: 'visible',
  },
  mapHeaderScrollOuter: {
    flexGrow: 0,
    flexShrink: 0,
    maxHeight: verticalScale(40),
    marginBottom: 0,
  },
  mapArea: {
    flex: 1,
    minHeight: verticalScale(140),
    borderRadius: moderateScale(8),
    overflow: 'hidden',
    position: 'relative',
  },
  mapFill: {
    ...StyleSheet.absoluteFillObject,
  },
  mapTypeTilesWrap: {
    position: 'absolute',
    left: horizontalScale(6),
    right: horizontalScale(6),
    bottom: verticalScale(6),
    zIndex: 100,
    elevation: Platform.OS === 'android' ? 24 : 0,
    alignItems: 'center',
  },
  mapTypeTilesTray: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(4),
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(6),
    borderRadius: moderateScale(12),
    backgroundColor: 'rgba(20,24,32,0.78)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.22)',
  },
  mapTypeTile: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(4),
    minWidth: 0,
    paddingVertical: verticalScale(4),
    paddingHorizontal: horizontalScale(5),
    borderRadius: moderateScale(8),
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  mapTypeTileActive: {
    backgroundColor: '#0a9396',
    borderColor: '#5eead4',
  },
  mapTypeTileLabel: {
    fontSize: moderateScale(9),
    fontFamily: 'NotoSans_SemiBold',
    color: 'rgba(255,255,255,0.9)',
    textAlign: 'center',
    flexShrink: 1,
  },
  mapTypeTileLabelActive: {
    color: '#fff',
  },
  bottomBtnHolder: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10),
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    gap: horizontalScale(10),
    backgroundColor: '#fff'
  },
  calloutToolTip: {
    backgroundColor: '#fff',
    minWidth: horizontalScale(200),
    padding: horizontalScale(10),
    borderRadius: moderateScale(10)
  },
  hr: {
    width: "100%",
    height: 1,
    backgroundColor: 'rgba(0,0,0,.15)',
    marginVertical: verticalScale(5)
  },
  activefireText: {
    fontSize: moderateScale(14),
    color: themeColor.danger500,
  },
  clickLabel: {
    color: themeColor.gray500,
    fontSize: moderateScale(14)
  },
  mapHeaderComponent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: horizontalScale(8),
    paddingVertical: verticalScale(4),
    paddingRight: horizontalScale(8),
  },
});
