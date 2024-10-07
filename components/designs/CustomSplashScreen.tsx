import { Image, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React, { useState } from 'react'
import NetInfo, { NetInfoState } from "@react-native-community/netinfo"
import { useFocusEffect, useRouter } from 'expo-router'
import { themeColor } from 'react-native-rapi-ui'

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import Color from '@/utils/Color'
import { ThemedText } from '@/components/ThemedText'
import { _delete_item_securestore, _get_item_securestore } from '@/utils/SecureStore'
import { checkIfDbExists, initializeDatabase } from '@/utils/sqlite/SQLiteDBLocals'
import URLs from '@/utils/URLs'

const CustomSplashScreen = () => {

    /* 
     1. Check for auth key in expo secure store.
     2. If not available then redirect to user select screen
     3. If available then check for internet connection 
     4. If internet connection is available validate the user session | 
        - If user session is valid then navigate to user select screen
     5. If no interet connection then redirect to dashboard sceeen
    */

    const router = useRouter();
    const [internetStatus, setInternetStatus] = useState<boolean | null>(false);

    const ValidateUser = async (): Promise<boolean> => {


        try {
            let auth_key: string | null = await _get_item_securestore('auth_key');

            const requestBody = new FormData();
            requestBody.append('auth_key', auth_key as string);

            const response = await fetch(`${URLs.api_base_url}validate_user`, {
                method: 'POST',
                body: requestBody
            });

            const responseJson = await response.json();
            if (responseJson.status !== "success") {
                await _delete_item_securestore('auth_key');
                return false;
            }

            return true;

        } catch (error) {
            console.log(error);
            return false;
        }
    }

    const CheckForAuth = async (): Promise<void> => {
        try {
            let result = await _get_item_securestore('auth_key');
            if (!result || result === null) {
                router.push('/UserSelect');
                return;
            }

            if (!await checkIfDbExists()) {
                if (internetStatus) {
                    if (await initializeDatabase()) {
                        // DB Initialized
                    } else {
                        // Navigate to Error Screen
                        return;
                    }
                } else {
                    // Navigate to no Internet Screen
                }
            }

            if (internetStatus) {
                if (await ValidateUser()) {
                    router.push("/Dashboard");
                } else {
                    router.push("/UserSelect");
                }
            }

            return;
        } catch (error) {
            console.log(error)
            // Move to error screen
            return;
        }
    }

    useFocusEffect(
        React.useCallback(() => {
            const removeNetInfoSubscription = NetInfo.addEventListener((state: NetInfoState) => {
                const status = (state.isConnected && state.isInternetReachable)
                setInternetStatus(status);
            });

            // check for user authentication and initializing database (for first time user)
            CheckForAuth();

            return () => removeNetInfoSubscription()
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <Image
                style={styles.loadingHeaderImage}
                source={require('../../assets/images/splash_anim.gif')} />
            <View style={styles.detailsHolder}>
                <ThemedText style={styles.appName} type='title'>
                    Forest Fire Reporting & Monitoring
                    {`\n`}
                    Uttarakhand Forest Department
                </ThemedText>
                <ThemedText style={styles.appName} type='title'>
                    वनाग्नि सूचना एवं अनुश्रवण {'\n'} उत्तराखण्ड वन विभाग
                </ThemedText>
                <Image
                    style={styles.tree_fire_image}
                    source={require('../../assets/images/icon_without_bg.png')}
                />
            </View>
            <View style={styles.bottomContainer}>
                <Image
                    style={styles.footerLogo}
                    source={require('../../assets/images/h2logo.jpg')}
                />
                <ThemedText style={styles.bottomText} type='default'>
                    An Initiative of {'\n'} Uttarakhand Forest Department
                </ThemedText>
                <Image
                    style={styles.footerLogo2}
                    source={require('../../assets/images/forest_logo0.png')}
                />
            </View>
        </SafeAreaView>
    )
}

export default CustomSplashScreen

const styles = StyleSheet.create({
    container: {
        display: "flex",
        alignItems: 'center',
        flex: 1
    },
    loadingHeaderImage: {
        resizeMode: 'cover',
        width: '100%',
        maxHeight: verticalScale(200)
    },
    appName: {
        fontSize: moderateScale(30),
        textAlign: 'center',
        color: Color.SpashScreenText,
        fontWeight: 'bold'
    },
    detailsHolder: {
        flex: 1,
        display: 'flex',
        gap: verticalScale(10),
        paddingTop: verticalScale(30),
        alignItems: 'center',
        paddingHorizontal: horizontalScale(10)
    },
    bottomContainer: {
        paddingVertical: verticalScale(30),
        paddingHorizontal: horizontalScale(12),
        display: 'flex',
        flexDirection: 'row',
        gap: horizontalScale(12),
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%'
    },
    bottomText: {
        color: themeColor.gray500,
        fontSize: moderateScale(12),
        fontWeight: '500',
        textAlign: 'center',
        textTransform: 'capitalize'
    },
    tree_fire_image: {
        width: horizontalScale(120),
        height: horizontalScale(120),
        objectFit: 'contain',
        marginTop: verticalScale(5)
    },
    footerLogo: {
        width: horizontalScale(50),
        height: horizontalScale(50),
        objectFit: 'contain'
    },
    footerLogo2: {
        width: horizontalScale(78),
        height: horizontalScale(45),
        objectFit: 'contain'
    }
})