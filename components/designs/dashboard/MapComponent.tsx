import Toast from 'react-native-toast-message';
import { themeColor } from 'react-native-rapi-ui';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'

import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import DashboardModal from '@/components/models/DashboardModal';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import FilterBtnComponent from './_subComponents/FilterBtnComponent';
import StatsBoxLabelValue from './_subComponents/StatsBoxLabelValue';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { filterMapAlertsFunctions } from './_subComponents/FilterMapAlertFunctions';
import { AlertsResponseDataType, CoordinatesType, UserCoordsType } from '@/utils/Types';

interface ComponentPropType {
  alertsData: AlertsResponseDataType[],
  fetchAlerts: () => Promise<void>
}

const MapComponent = ({ fetchAlerts, alertsData }: ComponentPropType) => {

  const Navigation = useNavigation();
  const { authUserData }: any = useAuth();

  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [PageError, SetPageError] = useState<boolean>(false);
  const [ModalVisible, SetModalVisible] = useState<boolean>(false);
  const [whichActiveBtn, setWhichActiveBtn] = useState<string>('all');
  const [selectedFire, SetSelectedFire] = useState<number | null>(null);
  const [loadingText, setLoadingText] = useState<string>("");
  const [userCoordinates, setUserCoordinates] = useState<UserCoordsType>();
  const [filteredAlertsData, setFilteredAlertsData] = useState<AlertsResponseDataType[]>([]);
  const [selectedCoordinates, setSelectedCoordinates] = useState<CoordinatesType>({ lat: 0, lng: 0 });

  const mapRef = useRef<any>("");

  const hanldeAlertClick = (alert_id: number, status: string | null, lat: string, lng: string): void => {
    setSelectedCoordinates({ lat: lat, lng: lng });
    SetSelectedFire(alert_id);
    setStatus(status);
    SetModalVisible(true);
  }

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
  }

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

    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Unable to get your location. Please try again'
      });
    } finally {
      setIsLoading(false);
      setLoadingText("Loading");
    }
  }

  const initializeMapScreen = async (): Promise<void> => {
    await getUserLocation();
  }

  const filterAlertsOnDistance = () => {
    if (userCoordinates) {
      return filterMapAlertsFunctions({
        alertsDataSet: alertsData,
        setAlertsData: setFilteredAlertsData,
        rangeInKmToCheck: 3000,
        userCoordinates: userCoordinates
      });
    }

    return setFilteredAlertsData(alertsData);
  }

  useEffect(() => {

    filterAlertsOnDistance();

  }, [userCoordinates])

  useEffect(() => {
    initializeMapScreen();

    return () => { }
  }, [authUserData])

  const animateToDivision = async () => {
    try {
      const latitude = await SecureStore.getItemAsync('latitude');
      const longitude = await SecureStore.getItemAsync('longitude');

      if (latitude && longitude) {
        const region = {
          latitudeDelta: 4.0,
          longitudeDelta: 4.0,
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
  }

  useEffect(() => {
    animateToDivision();
  }, []);

  if (PageError) {
    return (
      <View style={styles.errorComponentHolder}>
        <Image style={styles.errorImage} source={require('../../../assets/images/error.jpg')} />
        <ThemedText style={styles.errorLabelText} type='defaultSemiBold'>
          Some problem occured {"\n"} while loading map.
        </ThemedText>
      </View>
    )
  }

  return (
    <View style={styles.mapHolderContainer}>
      <LoadingIndicator text={loadingText} visible={isLoading} />
      <DashboardModal
        // @ts-ignore
        handleMarkerClickFun={handleMarkerClick}
        SelectedFire={selectedFire}
        SelectedCoordinates={selectedCoordinates}
        SetModalVisible={SetModalVisible}
        visible={ModalVisible}
        Navigation={Navigation}
        status={status}
        getDataFunction={fetchAlerts}
        authUserData={authUserData}
        SetPageError={SetPageError}
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
        mapType='standard'
        initialRegion={{
          latitude: parseFloat(authUserData.latitude),
          longitude: parseFloat(authUserData.longitude),
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        }}
        style={styles.mapHolder}
      >
        {filteredAlertsData && filteredAlertsData.map((props: AlertsResponseDataType, index: number) => {
          return (

            <Marker
              key={index}
              coordinate={{ latitude: props.lat ? parseFloat(props.lat as string) : 0, longitude: props.lng ? parseFloat(props.lng as string) : 0 }}
              title={'Fire Station'}
              description={'New Fire Alert'}
              onCalloutPress={() => hanldeAlertClick(props.alert_id, props.status, props.lat as string, props.lng as string)}
            >
              {
                props.status == "active" ? <Image source={require('../../../assets/images/active_alert_2.png')} style={{ height: 35, width: 35 }} /> : <Image source={require('../../../assets/images/being_held_alert.png')} style={{ height: 35, width: 35 }} />
              }

              <Callout tooltip style={[styles.calloutToolTip]}>
                <ThemedText type='defaultSemiBold' style={styles.activefireText}>
                  Active Fire
                </ThemedText>
                <View style={styles.hr}></View>
                <StatsBoxLabelValue label={"Alert ID"} value={props.alert_id} />
                <StatsBoxLabelValue label={"Latitude"} value={props.lat} />
                <StatsBoxLabelValue label={"Longitude"} value={props.lng} />
                <StatsBoxLabelValue label={"Handler"} value={props.handler} />
                <StatsBoxLabelValue label={"Datetime"} value={props.datetime} />
                <StatsBoxLabelValue label={"Submitted By"} value={props.submitted_by} />
                <View style={styles.hr}></View>
                <ThemedText type='default' style={styles.activefireText}>
                  {
                    props.status == "active" ? "Click to update the alert status \ क्लिक करें" : "Close fire / आग बुझाने की सूचना के लिए क्लिक करें"
                  }
                </ThemedText>
              </Callout>
            </Marker>
          )
        })}
      </MapView>
    </View>
  )
}

export default MapComponent

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
})