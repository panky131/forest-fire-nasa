import { Image, StyleSheet, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import React from 'react'

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import Color from '@/utils/Color'
import { themeColor } from 'react-native-rapi-ui'
import { ThemedText } from '@/components/ThemedText'

const CustomSplashScreen = () => {
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