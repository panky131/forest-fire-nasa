import { Image, StyleSheet, Platform, View, TouchableOpacity } from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { themeColor } from 'react-native-rapi-ui';
import { Link, useNavigation } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import Constants from "expo-constants";
import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import Toast from 'react-native-toast-message';
// @ts-ignore
import RadioButtonRN from 'radio-buttons-react-native-expo';

import { MaterialCommunityIcons } from '@expo/vector-icons';

import ParallaxScrollView from '@/components/ParallaxScrollView';
import { verticalScale, horizontalScale, moderateScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import Color from '@/utils/Color';
import { ThemedText } from '@/components/ThemedText';
import URLs from '@/utils/URLs';

export default function HomeScreen() {

  const Navigation = useNavigation();

  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  const [expoPushToken, setExpoPushToken] = useState<string>("");
  const [notification, setNotification] = useState();

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingModalText, setLoadingModalText] = useState<string | null>(null);
  const [SelectedButton, SetSelectedButton] = useState<string | null>(null);

  const handleNext = (): void => {
    if (SelectedButton == null) return;

    if (SelectedButton == 'OfficeStaff') {
      Navigation.navigate('OfficeStaffLogin' as never);
    } else {
      Navigation.navigate('VolunteerLogin' as never);
    }
  }

  const storeTokenInDatabase = async (token: string) => {
    try {

      setIsLoading(true);
      console.log('Storing token in db :- ' + token)
      const data = new FormData();
      data.append("token", token);
      const response = await fetch(`${URLs.api_base_url}register_token.php`, {
        method: "POST",
        body: data
      });

      const responseJson = await response.json();
      if (responseJson?.status === "success") {
        console.log('Token stored successfully !');
      } else {
        console.log("Unable to store token in database Inner");
      }

    } catch (error) {
      console.log(error)
      console.log("Unable to store token in database outer");
    } finally {
      setIsLoading(false);
    }
  };

  const registerForPushNotificationsAsync = async () => {
    try {
      setIsLoading(true);
      let token;

      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
          const { status } = await Notifications.requestPermissionsAsync();
          finalStatus = status;
        }
        if (finalStatus !== 'granted') {
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Failed to get push token for push notification!',
          });
          // alert('');
          return;
        }
        const projectId =
          Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Project ID not found',
          });
          console.log('Project ID not found');
          return "";
        }

        token = (await Notifications.getExpoPushTokenAsync({
          projectId
        })).data;
        console.log(token);
      } else {
        alert('Must use physical device for Push Notifications');
      }

      return token;
    } catch (error) {
      console.log(error);
      Toast.show({
        type: 'error',
        text1: 'Oops!',
        text2: 'Problems while getting notification token'
      });
      console.log(`Problems while getting notification token`);
      return "";
    } finally {
      setIsLoading(false);
    }
  }
  
  const checkFirstLaunch = async () => {
    try {
      setIsLoading(true);
      const isFirstLaunch = await SecureStore.getItemAsync('isFirstLaunch');
      if (isFirstLaunch === null || !isFirstLaunch) {
        console.log(`This is first launch of app`);
        const token = await registerForPushNotificationsAsync();
        console.log(`Token returned is :- ${token}`)
        if (token) {
          setExpoPushToken(token);
          await storeTokenInDatabase(token);
          await SecureStore.setItemAsync("isFirstLaunch", "true");
        } else {
          Toast.show({
            type: 'error',
            text1: 'Oops!',
            text2: 'Unable to register for push notifications'
          });
          console.log("Unable to register for push notifications | Outer reach");
        }
      } else {
        console.log(`This is not first launch of app`);
      }
    } catch (error) {
      console.log(error);
      console.log(`Error while processing first launch`);
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {

    checkFirstLaunch();

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
      <LoadingIndicator visible={isLoading} text={loadingModalText} />

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
