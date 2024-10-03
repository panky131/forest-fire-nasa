import React, { useState, useEffect, useRef } from 'react'
import { Alert } from 'react-native';
import { StyleSheet, View, Image } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Button, themeColor } from 'react-native-rapi-ui';
import { useIsFocused, useNavigation } from '@react-navigation/native';

import * as SecureStore from 'expo-secure-store';

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { useAuth } from '@/hooks/useAuth';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import URLs from '@/utils/URLs';
import DashboardModal from '@/components/models/DashboardModal';
import { ThemedText } from '@/components/ThemedText';
import { router } from 'expo-router';


interface coordinatesType {
  lat: string | number,
  lng: string | number
}

interface MarkersType {
  lat: string | number,
  lng: string | number,
  latitudeDelta: string | number,
  longitudeDelta: string | number,
}

const Dashboard = () => {

  // user authentication data and navigation
  const Navigation = useNavigation();
  const { authUserData } = useAuth();
  console.log(authUserData)
  const isFocused = useIsFocused();
  // page states
  const [isLoading, setIsLoading] = useState(false);
  const [ModalVisible, SetModalVisible] = useState(false);
  const [SelectedFire, SetSelectedFire] = useState<string | null>(null);
  const [SelectedCoordinates, SetSelectedCoordinates] = useState<coordinatesType>({ lat: 0, lng: 0 });
  const [status, setStatus] = useState<string | null>(null);
  const mapRef = useRef<any>("");

  const [PageError, SetPageError] = useState(false);
  const [PageData, SetPageData] = useState<MarkersType[]>(
    [
      {
        lat: 0,
        lng: 0,
        latitudeDelta: 0.09,
        longitudeDelta: 0.02,
      }
    ]
  );

  const GetAlertsData = async () => {
    try {
      setIsLoading(true);
      SetPageError(false);

      const authKey: string | null = await SecureStore.getItemAsync('auth_key');
      // const divisionId=authUserData.division_id;

      const formData = new FormData();
      formData.append('unique_id', authKey as never);
      // formData.append('division_id', divisionId);
      // console.log("form data"+formData)
      let random = Math.floor(Math.random() * 9999);
      let url = URLs.api_base_url + `get_alerts.php?random=${random}`;
      const response = await fetch(url, {
        method: "POST",
        body: formData,
        cache: 'no-cache'
      });

      const responseJson = await response.json();
      if (responseJson.status != "success") {
        SetPageError(true);
        return;
      }
      SetPageData(responseJson.alerts);


    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      setIsLoading(false);
    }
  }

  const hanldeAlertClick = (alert_id: string, status: string | null, lat: string, lng: string) => {
    let temp: coordinatesType = {
      lat: lat,
      lng: lng
    };
    SetSelectedCoordinates(temp);
    SetSelectedFire(alert_id);
    setStatus(status);
    SetModalVisible(true);
  }

  const handleMarkerClick = (alert_id: string | number) => {
    Alert.alert('Confirm', 'Do you want to close this Fire.?', [
      {
        text: 'Cancel',
        onPress: () => console.log('Cancel Pressed'),
        style: 'cancel',
      },
      {
        text: 'OK', onPress: () => {
          router.push({ pathname: "/ExistingFireReport", params: { alert_id: alert_id, lat: SelectedCoordinates.lat, lng: SelectedCoordinates.lng } });
        }
      },
    ]);
  }

  const LabelValue = ({ label, value }: {
    label: string,
    value: string
  }) => {
    return (
      <View style={styles.flex}>
        <ThemedText type='default' style={styles.boxLabel}>
          {label}
        </ThemedText>
        <ThemedText type='default' style={styles.boxValue}>
          {value}
        </ThemedText>
      </View>
    )
  }

  const defaultLatitude = 30.3165;
  const defaultLongitude = 78.0322;

  useEffect(() => {
    GetAlertsData();

    return () => { }
  }, [authUserData])

  useEffect(() => {
    setTimeout(async () => {
      let latitude = await SecureStore.getItemAsync('latitude');
      let longitude = await SecureStore.getItemAsync('longitude');
      console.log(latitude)
      console.log(longitude)
      const region = {
        latitudeDelta: 0.989999,
        longitudeDelta: 0.989999,
        latitude: parseFloat(latitude as string),
        longitude: parseFloat(longitude as string),
      };
      mapRef.current?.animateToRegion(region, 2000);
    }, 4000);

    return () => { }
  }, [])


  return (
    <View style={styles.outerContainer}>
      <LoadingIndicator text={'Getting alerts'} visible={isLoading} />
      <DashboardModal
        // @ts-ignore
        handleMarkerClickFun={handleMarkerClick}
        SelectedFire={SelectedFire}
        SelectedCoordinates={SelectedCoordinates}
        SetModalVisible={SetModalVisible}
        visible={ModalVisible}
        Navigation={Navigation}
        status={status}
        getDataFunction={GetAlertsData}
        authUserData={authUserData}
        SetPageError={SetPageError}
        setIsLoading={setIsLoading}
      />
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        mapType='standard'
        // minZoomLevel={3}
        initialRegion={{
          latitude: parseFloat(authUserData.latitude),
          longitude: parseFloat(authUserData.longitude),
          latitudeDelta: 0.02,
          longitudeDelta: 0.01,
        }}
        style={styles.mapHolder}
      >
        {PageData && PageData.map((props: any, index: number) => {
          return (

            <Marker
              key={index}
              coordinate={{ latitude: props.lat ? parseFloat(props.lat as string) : 0, longitude: props.lng ? parseFloat(props.lng as string) : 0 }}
              title={'Fire Station'}
              description={'New Fire Alert'}
              onCalloutPress={() => hanldeAlertClick(props.alert_id, props.status, props.lat, props.lng)}
            >
              {
                props.status == "active" ? <Image source={require('../../../assets/images/active_alert_2.png')} style={{ height: 35, width: 35 }} /> : <Image source={require('../../../assets/images/being_held_alert.png')} style={{ height: 35, width: 35 }} />
              }

              <Callout tooltip style={[styles.calloutToolTip]}>
                <ThemedText type='defaultSemiBold' style={styles.activefireText}>
                  Active Fire
                </ThemedText>
                <View style={styles.hr}></View>
                <LabelValue label={"Alert ID"} value={props.alert_id} />
                <LabelValue label={"Latitude"} value={props.lat} />
                <LabelValue label={"Longitude"} value={props.lng} />
                <LabelValue label={"Handler"} value={props.handler} />
                <LabelValue label={"Datetime"} value={props.datetime} />
                <LabelValue label={"Submitted By"} value={props.submitted_by} />
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

      <View style={styles.bottomBtnHolder}>
        <Button
          size='sm'
          status='warning'
          textStyle={{ color: 'rgba(0,0,0,.6)' }}
          text='नयी आग की सूचना दे / Report New Fire Incident'
          onPress={() => router.push('/NewFireIncident')}
        />
        {/* <Button
          size='sm'
          status='info'
          text='आग बुझाने की सूचना दे'
          onPress={() => Navigation.navigate('ExistingFireReport')}
        /> */}
        <Button
          size='sm'
          status='info'
          text='कंट्रोल रूम से संपर्क करे / Contact Control Room'
          onPress={() => router.push('/ControllRoomInformation')}
        />
        {/* {authUserData && authUserData.user_type && authUserData.user_type == "gov" && <Button
          size='sm'
          status='warning'
          textStyle={{ color: 'rgba(0,0,0,.6)' }}
          text='गाँव की लिस्ट'
          onPress={() => Navigation.navigate('ViilagesList')}
        />} */}
      </View>
    </View >
  )
}

export default Dashboard

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1
  },
  mapHolder: {
    flex: 1
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
  flex: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    gap: horizontalScale(10),
    marginVertical: verticalScale(2)
  },
  boxLabel: {
    color: themeColor.gray400,
    fontSize: moderateScale(12)
  },
  boxValue: {
    fontSize: moderateScale(13),
    color: themeColor.primary500
  },
  clickLabel: {
    color: themeColor.gray500,
    fontSize: moderateScale(14)
  }
})