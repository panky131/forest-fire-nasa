import { themeColor } from 'react-native-rapi-ui';
import { Link, useNavigation } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import * as Notifications from "expo-notifications";
// @ts-ignore
import RadioButtonRN from 'radio-buttons-react-native-expo';
import { Image, StyleSheet, View, TouchableOpacity } from 'react-native';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import Color from '@/utils/Color';
import { ThemedText } from '@/components/ThemedText';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { verticalScale, horizontalScale, moderateScale } from '@/utils/Metrics';

export default function HomeScreen() {

  const Navigation = useNavigation();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const [notification, setNotification] = useState();

  const [SelectedButton, SetSelectedButton] = useState<string | null>(null);

  const handleNext = (): void => {
    if (SelectedButton == null) return;

    if (SelectedButton == 'OfficeStaff') {
      Navigation.navigate('OfficeStaffLogin' as never);
    } else {
      Navigation.navigate('VolunteerLogin' as never);
    }
  }

  useEffect(() => {
    notificationListener.current = Notifications.addNotificationReceivedListener((notification) => {
      setNotification(notification as never);
    });

    responseListener.current = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log(response);
    });

    return () => {
      Notifications.removeNotificationSubscription(notificationListener.current);
      Notifications.removeNotificationSubscription(responseListener.current);
    };
  }, []);


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
            }]
          }
          selectedBtn={(e: any) => SetSelectedButton(e.accessibilityLabel)}
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
