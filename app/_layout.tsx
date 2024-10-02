import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import Toast, { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AuthProvider } from '@/hooks/useAuth'

import { useColorScheme } from '@/hooks/useColorScheme';
import NavigatorController from '@/components/navigation/NavigatorController';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    NotoSans_Regular: require('../assets/fonts/Noto_Sans/static/NotoSans-Regular.ttf'),
    NotoSans_SemiBold: require('../assets/fonts/Noto_Sans/static/NotoSans-SemiBold.ttf'),
    NotoSans_Bold: require('../assets/fonts/Noto_Sans/static/NotoSans-Bold.ttf'),
    NotoSans_ExtraBold: require('../assets/fonts/Noto_Sans/static/NotoSans-ExtraBold.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
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
  );
}
