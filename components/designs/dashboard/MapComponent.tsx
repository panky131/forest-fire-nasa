import Toast from 'react-native-toast-message';
import { themeColor } from 'react-native-rapi-ui';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Image, StyleSheet, View } from 'react-native';
import MapView, { Callout, PROVIDER_GOOGLE } from 'react-native-maps';

import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

import { ThemedText } from '@/components/ThemedText';
import DashboardModal from '@/components/models/DashboardModal';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import FilterBtnComponent from './_subComponents/FilterBtnComponent';
import StatsBoxLabelValue from './_subComponents/StatsBoxLabelValue';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { AlertsResponseDataType, CoordinatesType, UserCoordsType } from '@/utils/Types';
import { AlertMarker } from './AlertMaker';

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  fetchAlerts: () => Promise<void>,
  userCoordinates: UserCoordsType | undefined,
  setUserCoordinates: React.Dispatch<React.SetStateAction<UserCoordsType | undefined>>,
  authUserData: any,
  filteredAlertsData: AlertsResponseDataType[],
  setFilteredAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>,
}

const MapComponent = (args: ComponentPropType) => {
  const { fetchAlerts, alertsData, filteredAlertsData, setFilteredAlertsData,
    userCoordinates, setUserCoordinates, authUserData } = args;

  const Navigation = useNavigation();

  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [pageError, setPageError] = useState<boolean>(false);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [whichActiveBtn, setWhichActiveBtn] = useState<string>('all');
  const [selectedFire, setSelectedFire] = useState<AlertsResponseDataType | null>(null);
  const [loadingText, setLoadingText] = useState<string>("");
  const [selectedCoordinates, setSelectedCoordinates] = useState<CoordinatesType>({ lat: 0, lng: 0 });

  const mapRef = useRef<any>("");

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

      <View style={styles.mapHeaderComponent}>
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
      </View>

      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType="standard"
        initialRegion={{
          latitude: parseFloat(authUserData.latitude),
          longitude: parseFloat(authUserData.longitude),
          latitudeDelta: 4.0,
          longitudeDelta: 4.0,
        }}
        style={styles.mapHolder}
      >
        {filteredAlertsData
          ?.filter(
            (props) =>
              props.lat &&
              props.lng &&
              !isNaN(parseFloat(props.lat as string)) &&
              !isNaN(parseFloat(props.lng as string))
          )
          .map((props: AlertsResponseDataType, index: number) => {
            const coordinate = {
              latitude: parseFloat(props.lat as string),
              longitude: parseFloat(props.lng as string),
            };

            const iconMap: Record<string, number> = {
              active: require("../../../assets/images/active_alert_2.png"),
              closed: require("../../../assets/images/closed_alert.png"),
              not_fire: require("../../../assets/images/not_fire.png"),
              being_held: require("../../../assets/images/being_held_alert.png"),
            };

            const icon = iconMap[props.status] ?? iconMap["closed"];

            return (
              <AlertMarker
                key={props.alert_id ?? index}
                coordinate={coordinate}
                icon={icon}
                onPressCallout={() =>
                  hanldeAlertClick(
                    props.alert_id,
                    props.status,
                    props.lat as string,
                    props.lng as string,
                    props
                  )
                }
              >
                <Callout tooltip style={[styles.calloutToolTip]}>
                  <ThemedText type="defaultSemiBold" style={styles.activefireText}>
                    Active Fire
                  </ThemedText>

                  <View style={styles.hr} />

                  <StatsBoxLabelValue label="Alert ID" value={props.alert_id} />
                  <StatsBoxLabelValue
                    label="Location"
                    value={`${props.lat} | ${props.lng}`}
                  />
                  <StatsBoxLabelValue label="Datetime" value={props.datetime} />
                  <StatsBoxLabelValue label="Range" value={props.range_name} />
                  <StatsBoxLabelValue label="Division" value={props.division} />
                  <StatsBoxLabelValue label="Beat" value={props.beat} />
                  <StatsBoxLabelValue label="Forest Type" value={props.ft_type} />

                  <View style={styles.hr} />

                  <ThemedText type="default" style={styles.activefireText}>
                    {props.status === "active"
                      ? "Click to update the alert status / क्लिक करें"
                      : props.status === "closed"
                        ? "Alert is closed"
                        : props.status === "not_fire"
                          ? "It is not a forest fire"
                          : "Close fire / आग बुझाने की सूचना के लिए क्लिक करें"}
                  </ThemedText>
                </Callout>
              </AlertMarker>
            );
          })}
      </MapView>

    </View>
  );
};

export default MapComponent;

const styles = StyleSheet.create({
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
  mapHolder: {
    flex: 1
  },
  mapHolderContainer: {
    flex: 1,
    paddingHorizontal: horizontalScale(15),
    backgroundColor: '#fff',
    borderRadius: moderateScale(10),
    overflow: 'hidden'
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
    width: '100%',
    paddingVertical: verticalScale(10),
    display: 'flex',
    gap: horizontalScale(4),
    flexDirection: 'row'
  },
});
