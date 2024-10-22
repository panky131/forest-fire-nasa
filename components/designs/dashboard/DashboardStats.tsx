import React, { useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, View } from 'react-native'

import * as SecureStore from 'expo-secure-store';

import URLs from '@/utils/URLs'
import { ThemedText } from '@/components/ThemedText'
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'

interface StatsBoxPropType {
    statsValue: number | string | undefined,
    statsLabel: string,
    statBoxBgColor: string
}

interface ResponseDataType {
    totalAlerts: number,
    activeAlerts: number,
    closedAlerts: number,
    beingHeld: number
}

interface AuthContextType {
    auth_key: string | null,
    mobile_number: string | number | null,
    user_type: string | null,
    user_name: null,
    latitude: number,
    longitude: number,
    division_id: number | string
}

const DashboardStats = () => {

    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isRequestError, setIsRequestError] = useState<boolean>(true);

    const [statsData, setStatsData] = useState<ResponseDataType>();

    const getAlertsStatsData = async (): Promise<void> => {
        try {

            setIsLoading(true);
            setIsRequestError(false);

            const authKey: string | null = await SecureStore.getItemAsync('auth_key');
            const divisionID: string | null = await SecureStore.getItemAsync('division_id');
            const URL = `${URLs.api_base_url}getDashboardStats.php?auth_key=${authKey}&division_id=${divisionID}`;

            const response = await fetch(URL, {
                method: 'GET'
            });

            if (response.status !== 200) {
                setIsRequestError(true);
                return;
            }

            const responseJSON = await response.json();
            const responseStatsData: ResponseDataType = responseJSON.data;
            setStatsData(responseStatsData);

        } catch (error) {
            console.log(error);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        getAlertsStatsData();

        return () => { }
    }, [])


    if (isLoading) return <LoadingView />

    return (
        <View style={styles.statsContainer}>

            <View style={styles.flexBoxContainer}>
                <StatsBox statsLabel='Total Alerts' statsValue={statsData && statsData.totalAlerts ? statsData.totalAlerts : 0} statBoxBgColor='#e63f66' />
                <StatsBox statsLabel='Active Alerts' statsValue={statsData && statsData.activeAlerts ? statsData.activeAlerts : 0} statBoxBgColor='#108554' />
            </View>
            <View style={styles.flexBoxContainer}>
                <StatsBox statsLabel='Being Held' statsValue={statsData && statsData.beingHeld ? statsData.beingHeld : 0} statBoxBgColor='#dd8d31' />
                <StatsBox statsLabel='Closed Alerts' statsValue={statsData && statsData.closedAlerts ? statsData.closedAlerts : 0} statBoxBgColor='#6374ae' />
            </View>

        </View>
    )
}

const LoadingView = (): React.JSX.Element => {
    return (
        <View style={styles.loadingContainer}>
            <ActivityIndicator size={'large'} />
        </View>
    )
}

const StatsBox = ({ statsValue, statsLabel, statBoxBgColor }: StatsBoxPropType) => {
    return (
        <View style={[styles.statsBox, { backgroundColor: statBoxBgColor }]}>
            <ThemedText style={styles.boxValueText} type='defaultSemiBold'>
                {statsValue}
            </ThemedText>
            <ThemedText style={styles.boxLabelText} type='default'>
                {statsLabel}
            </ThemedText>
        </View>
    )
}

export default DashboardStats

const styles = StyleSheet.create({
    statsContainer: {
        backgroundColor: '#fff',
        paddingHorizontal: horizontalScale(15),
        paddingVertical: verticalScale(15),
        borderRadius: moderateScale(8),
        display: 'flex',
        gap: verticalScale(10)
    },
    flexBoxContainer: {
        display: 'flex',
        flexDirection: 'row',
        gap: horizontalScale(10),
        aspectRatio: 16 / 4
    },
    statsBox: {
        flex: 1,
        backgroundColor: '#eee',
        borderRadius: moderateScale(10),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    boxValueText: {
        fontSize: moderateScale(17),
        color: '#fff'
    },
    boxLabelText: {
        fontSize: moderateScale(13),
        color: '#fff'
    },
    // for loading component
    loadingContainer: {
        width: '100%',
        paddingVertical: verticalScale(30),
        backgroundColor: '#fff'
    }
})