import { themeColor } from 'react-native-rapi-ui';
import { router, useNavigation } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react'
import { Alert, Image, StyleSheet, View } from 'react-native'

import * as SecureStore from 'expo-secure-store';

import URLs from '@/utils/URLs';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import DashboardModal from '@/components/models/DashboardModal';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

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

const MapComponent = () => {

    const Navigation = useNavigation();
    const { authUserData }: any = useAuth();

    const [status, setStatus] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [ModalVisible, SetModalVisible] = useState<boolean>(false);
    const [SelectedFire, SetSelectedFire] = useState<string | null>(null);
    const [SelectedCoordinates, SetSelectedCoordinates] = useState<coordinatesType>({ lat: 0, lng: 0 });

    const mapRef = useRef<any>("");

    const [PageError, SetPageError] = useState<boolean>(false);
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

    const GetAlertsData = async (): Promise<void> => {
        try {
            setIsLoading(true);
            SetPageError(false);

            const authKey: string | null = await SecureStore.getItemAsync('auth_key');

            const formData = new FormData();
            formData.append('unique_id', authKey as never);
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

    const hanldeAlertClick = (alert_id: string, status: string | null, lat: string, lng: string): void => {
        let temp: coordinatesType = {
            lat: lat,
            lng: lng
        };
        SetSelectedCoordinates(temp);
        SetSelectedFire(alert_id);
        setStatus(status);
        SetModalVisible(true);
    }

    const handleMarkerClick = (alert_id: string | number): void => {
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