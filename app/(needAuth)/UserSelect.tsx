import { themeColor } from 'react-native-rapi-ui';
import { Link, router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
// @ts-ignore
import RadioButtonRN from 'radio-buttons-react-native-expo';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Color from '@/utils/Color';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { verticalScale, horizontalScale, moderateScale } from '@/utils/Metrics';
import { shouldDeferExpoNotifications } from '@/utils/expoNotificationsGate';

export type LoginUserTypes = "OfficeStaff" | "Volunteer" | "SDRF" | "RevenueStaff";

export default function HomeScreen() {

  const notificationListener = useRef<{ remove: () => void } | null>(null);
  const responseListener = useRef<{ remove: () => void } | null>(null);

  const [selectedButton, setSelectedButton] = useState<LoginUserTypes | null>(null);

  useEffect(() => {
    let cancelled = false;

    const setup = async () => {
      if (shouldDeferExpoNotifications()) {
        return;
      }
      try {
        const Notifications = await import("expo-notifications");
        if (cancelled) return;
        notificationListener.current = Notifications.addNotificationReceivedListener(
          (notification) => {
            console.log("[push] notification received", notification.request.identifier);
          }
        );
        responseListener.current =
          Notifications.addNotificationResponseReceivedListener((response) => {
            console.log("[push] notification response", response);
          });
      } catch (e) {
        console.warn("[UserSelect] expo-notifications unavailable", e);
      }
    };

    void setup();

    return () => {
      cancelled = true;
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, []);

  const handleNext = (): void => {
    if (!selectedButton) return;

    const pathMap: Record<LoginUserTypes, string> = {
      OfficeStaff: '/(needAuth)/OfficeStaffLogin',
      Volunteer: '/(needAuth)/VolunteerLogin',
      SDRF: '/(needAuth)/SDRFLogin',
      RevenueStaff: '/(needAuth)/RevenueStaffLogin',
    };

    router.push(pathMap[selectedButton] as never);
  };

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
      headerImage={
        <Image
          source={require('@/assets/images/loading.jpg')}
          style={styles.headerLogo}
        />
      }>

      <TouchableOpacity>
        <Link style={[styles.reportBtn, {
          backgroundColor: themeColor.danger600
        }]} href={'./NewFireIncidentPublic'}>
          <View style={styles.ButtonTextHolder}>
            <MaterialCommunityIcons name="fire" size={moderateScale(24)} color="#fff" />
            <ThemedText style={styles.linkBtnText} type='link'>
              वन अग्नि की सूचना दे / Report Fire Incident
            </ThemedText>
          </View>
        </Link>
      </TouchableOpacity>

      <TouchableOpacity>
        <Link style={[styles.reportBtn, {
          backgroundColor: themeColor.info600
        }]} href={'./ControlRoomInfo'}>
          <View style={styles.ButtonTextHolder}>
            <MaterialCommunityIcons name="fire" size={moderateScale(24)} color="#fff" />
            <ThemedText style={styles.linkBtnText} type='link'>
              कंट्रोल रूम से संपर्क करे / Contact Control Room
            </ThemedText>
          </View>
        </Link>
      </TouchableOpacity>

      <TouchableOpacity>
        <Link style={[styles.reportBtn, {
          backgroundColor: themeColor.warning600
        }]} href={'/(needAuth)/Warning'}>
          <View style={styles.ButtonTextHolder}>
            <MaterialCommunityIcons name="fire" size={moderateScale(24)} color="#fff" />
            <ThemedText style={styles.linkBtnText} type='link'>
              चेतावनी / Warning
            </ThemedText>
          </View>
        </Link>
      </TouchableOpacity>

      <View style={styles.detailsHolder}>
        <ThemedText style={styles.loginText} type='subtitle'>
          लॉगिन करें / Login
        </ThemedText>
        <RadioButtonRN
          data={
            [{
              label: 'Volunteer / स्वयंसेवी',
              accessibilityLabel: 'Volunteer'
            },
            {
              label: 'Forest staff / वन कर्मी',
              accessibilityLabel: 'OfficeStaff'
            },
            {
              label: 'SDRF',
              accessibilityLabel: 'SDRF'
            },
            {
              label: 'Revenue Staff',
              accessibilityLabel: 'RevenueStaff'
            }]
          }
          selectedBtn={(e: any) => setSelectedButton(e.accessibilityLabel)}
        />
      </View>

      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          onPress={() => handleNext()}
          style={styles.nextBtn}>
          <ThemedText style={[styles.linkBtnText,
          { textAlign: 'center' }]} type='link'>
            Next / आगे बढ़ें
          </ThemedText>
        </TouchableOpacity>
      </View>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerLogo: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    width: '100%',
    height: verticalScale(240)
  },
  reportBtn: {
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    borderRadius: moderateScale(4),
    flex: 1
  },
  linkBtnText: {
    color: '#fff',
    fontSize: moderateScale(13),
    marginLeft: horizontalScale(3)
  },
  ButtonTextHolder: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailsHolder: {
    paddingTop: verticalScale(20),
    paddingBottom: verticalScale(5),
    flex: 1,
    paddingHorizontal: horizontalScale(15),
    marginTop: verticalScale(10)
  },
  loginText: {
    color: Color.SpashScreenText,
  },
  bottomButtonContainer: {
    paddingHorizontal: horizontalScale(10),
  },
  nextBtn: {
    backgroundColor: Color.SpashScreenText,
    paddingVertical: verticalScale(15),
    borderRadius: moderateScale(100)
  },
});
