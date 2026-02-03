import { Drawer } from 'expo-router/drawer';
import { Href, router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Image, Pressable, TouchableOpacity, View } from 'react-native';

import Color from '@/utils/Color';
import { ThemedText } from '@/components/ThemedText';
import { AntDesign, MaterialCommunityIcons } from '@expo/vector-icons';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

interface ScreenType {
  title: string,
  name: string;
}

export default function Layout() {

  const SCREENS: ScreenType[] = [
    {
      title: 'Dashboard / डैशबोर्ड',
      name: 'Dashboard'
    },
    {
      title: 'संयुक्त पहल',
      name: 'AboutUs'
    },
    {
      title: 'Report Fire / नई आग की सूचना दे',
      name: 'NewFireIncident'
    },
    {
      title: 'Contact / कंट्रोल रूम से संपर्क करे',
      name: 'ControllRoomInformation'
    },
    {
      title: 'लॉगआउट करे',
      name: 'Logout'
    },
    {
      title: 'आग बुझाने की सूचना दे',
      name: 'ExistingFireReport'
    },
    {
      title: 'MCR | Not a fire',
      name: 'NotAFireMCR'
    },
    {
      title: 'Not a fire',
      name: 'NotAFire'
    },
    {
      title: 'MCR | Existing Fire Report',
      name: 'ExistingFireReportMCR'
    },
    {
      title: 'Send Video (वीडियो भेजे)',
      name: 'SendVideo'
    },
    {
      title: 'Warning (चेतावनी)',
      name: 'Warning'
    },
    {
      title: 'Pre Fire Alert',
      name: 'FreeFire'
    },
    {
      title: 'Announcements',
      name: 'Announcements'
    },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Drawer
        screenOptions={{
          headerTitleStyle: {
            fontFamily: 'NotoSans_SemiBold',
            color: '#fff',
            fontSize: moderateScale(16)
          },
          headerStyle: {
            backgroundColor: Color.SpashScreenText,
          },
          headerTintColor: '#fff'
        }}
        drawerContent={() => {
          return (
            <View style={{
              flex: 1, backgroundColor: Color.SpashScreenText,
              display: 'flex',
              justifyContent: 'space-between'
            }}>
              <View style={{
                paddingHorizontal: horizontalScale(10),
                paddingVertical: verticalScale(10),
              }}>
                <Image
                  style={{
                    width: '100%',
                    height: moderateScale(120),
                    borderRadius: moderateScale(10),
                    marginTop: verticalScale(25)
                  }}
                  source={require('../../../assets/images/loading.jpg')}
                />
                <ThemedText
                  type='subtitle'
                  style={{
                    color: '#fff',
                    fontSize: moderateScale(15),
                    marginTop: verticalScale(5),
                    paddingHorizontal: horizontalScale(5),
                    borderBottomColor: '#fff',
                    borderBottomWidth: 1,
                    paddingBottom: verticalScale(10)
                  }}
                >
                  An initiative of Uttrakhand Forest Department
                </ThemedText>
              </View>
              <View style={{ flex: 1 }}>
                <Pressable
                  onPress={() => router.push('/Dashboard' as Href)}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    marginTop: verticalScale(15)
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <AntDesign name="home" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='default' style={{
                      color: '#fff',
                      fontSize: moderateScale(14)
                    }}>
                      Dashboard (डैशबोर्ड)
                    </ThemedText>
                  </View>
                </Pressable>
                <TouchableOpacity
                  onPress={() => router.push('/NewFireIncident')}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    marginTop: verticalScale(18)
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <MaterialCommunityIcons name="fire" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='default' style={{
                      color: '#fff',
                      fontSize: moderateScale(14)
                    }}>
                      Report Incident (आग की सूचना दें)
                    </ThemedText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/(needAuth)/Warning')}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    marginTop: verticalScale(18)
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <MaterialCommunityIcons name="fire" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='default' style={{
                      color: '#fff',
                      fontSize: moderateScale(14)
                    }}>
                      Warning (चेतावनी)
                    </ThemedText>
                  </View>
                </TouchableOpacity>
                {/* <TouchableOpacity
                  onPress={() => router.push('/(needAuth)/HarelaReport')}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    marginTop: verticalScale(18)
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <MaterialCommunityIcons name="cannabis" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='default' style={{
                      color: '#fff',
                      fontSize: moderateScale(14)
                    }}>
                      Hrela (हरेला)
                    </ThemedText>
                  </View>
                </TouchableOpacity> */}
                <TouchableOpacity
                  onPress={() => router.push('/Announcements')}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    marginTop: verticalScale(18)
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <MaterialCommunityIcons name="cannabis" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='default' style={{
                      color: '#fff',
                      fontSize: moderateScale(14)
                    }}>
                      Announcements
                    </ThemedText>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => router.push('/ControllRoomInformation' as Href)}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                    marginTop: verticalScale(18)
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <MaterialCommunityIcons name="contacts" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='default' style={{
                      color: '#fff',
                      fontSize: moderateScale(14)
                    }}>
                      Contact (कंट्रोल रूम से संपर्क करे)
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{
                borderTopColor: '#fff',
                borderTopWidth: 1,
                paddingVertical: verticalScale(20),
              }}>
                <TouchableOpacity
                  onPress={() => router.push('/Logout')}
                  style={{
                    paddingHorizontal: horizontalScale(10),
                  }}>
                  <View style={{
                    display: 'flex',
                    flexDirection: 'row',
                    gap: horizontalScale(10),
                    alignItems: 'center'
                  }}>
                    <MaterialCommunityIcons name="logout" size={moderateScale(24)} color="#fff" />
                    <ThemedText type='defaultSemiBold' style={{ color: '#fff', fontSize: moderateScale(15) }}>
                      Logout (लॉगआउट करे)
                    </ThemedText>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
      >

        {SCREENS && SCREENS.map((props, index) => {
          return (
            <Drawer.Screen
              key={index}
              options={{
                title: props.title
              }}
              name={props.name} />
          );
        })}
      </Drawer>
    </GestureHandlerRootView>
  );
}