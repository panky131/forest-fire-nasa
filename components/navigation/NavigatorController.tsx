import React, { useEffect, useRef, useState } from 'react'
import { Slot, Stack } from 'expo-router';
import { Animated } from 'react-native';

import CustomSplashScreen from '@/components/designs/CustomSplashScreen';

const NavigatorController = () => {

    const authenticated: boolean = true;

    const [showCustomSplashScreen, setShowCustomSplashScreen] = useState<boolean>(true);
    const fadeAnimation = useRef(new Animated.Value(1)).current;

    useEffect(() => {
        const timer = setTimeout(() => {
            Animated.timing(fadeAnimation, {
                toValue: 0,
                duration: 500,
                useNativeDriver: true,
            }).start(() => {
                setShowCustomSplashScreen(false);
            });
        }, 2000);

        return () => clearTimeout(timer);
    }, [fadeAnimation]);

    return (
        <>
            {showCustomSplashScreen ? (
                <Animated.View style={{ flex: 1, opacity: fadeAnimation }}>
                    <CustomSplashScreen />
                </Animated.View>
            ) : <Slot />}
        </>
    )
}

export default NavigatorController
