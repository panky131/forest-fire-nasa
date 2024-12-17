import 'react-native-reanimated';

import { useFonts } from 'expo-font';
import { AppState } from 'react-native';
import { useEffect, useRef } from 'react';
import { AuthProvider } from '@/hooks/useAuth'
import * as SplashScreen from 'expo-splash-screen';
import { ThemeProvider as RapidThemeProvider } from "react-native-rapi-ui";
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';


import { useColorScheme } from '@/hooks/useColorScheme';
import NavigatorController from '@/components/navigation/NavigatorController';
import { checkAndUploadData, registerBackgroundFetchAsync, unregisterBackgroundFetchAsync } from '@/tasks/BackgroundTaskHandler';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  const appState = useRef(AppState.currentState);

  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    NotoSans_Regular: require('../assets/fonts/Noto_Sans/static/NotoSans-Regular.ttf'),
    NotoSans_SemiBold: require('../assets/fonts/Noto_Sans/static/NotoSans-SemiBold.ttf'),
    NotoSans_Bold: require('../assets/fonts/Noto_Sans/static/NotoSans-Bold.ttf'),
    NotoSans_ExtraBold: require('../assets/fonts/Noto_Sans/static/NotoSans-ExtraBold.ttf'),
  });

  useEffect((): any => {
    const setupBackgroundTasks = async () => {
      try {
        if (appState.current !== 'active') {
          await registerBackgroundFetchAsync();
          console.log('Background fetch registered successfully');
        }
      } catch (error) {
        console.error('Error registering background fetch:', error);
      }
    };

    const subscription = AppState.addEventListener('change', async (nextAppState) => {
      if (nextAppState === 'active') {
        console.log('App has come to the foreground!');
        await checkAndUploadData();
      }
      appState.current = nextAppState;
      console.log('AppState:', appState.current);
    });

    setupBackgroundTasks();

    return async () => {
      try {
        await unregisterBackgroundFetchAsync();
        console.log('Background fetch unregistered successfully');
      } catch (error) {
        console.error('Error unregistering background fetch:', error);
      }
      subscription.remove();
    };
  }, []);

  useEffect(() => {
    let timeoutId: any;

    if (loaded) {
      SplashScreen.hideAsync();
    } else {
      timeoutId = setTimeout(() => SplashScreen.hideAsync(), 5000);
    }

    return () => clearTimeout(timeoutId);
  }, [loaded]);


  if (!loaded) {
    return null;
  }


  return (
    <RapidThemeProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthProvider>
          <NavigatorController />
          <Toast position='bottom'
            config={
              {
                success: (props) => (
                  <BaseToast
                    {...props}
                    style={{ borderLeftColor: 'pink' }}
                    contentContainerStyle={{ paddingHorizontal: 15 }}
                    text1Style={{
                      fontSize: 15,
                      fontWeight: '400',
                      fontFamily: 'NotoSans_Regular'
                    }}
                  />
                ),
                error: (props) => (
                  <ErrorToast
                    {...props}
                    text1Style={{
                      fontSize: 15,
                      fontFamily: 'NotoSans_SemiBold'
                    }}
                    text2Style={{
                      fontSize: 13,
                      fontFamily: 'NotoSans_Regular'
                    }}
                  />
                ),
              }
            }
          />
        </AuthProvider>
      </ThemeProvider>
    </RapidThemeProvider>

  );
}
