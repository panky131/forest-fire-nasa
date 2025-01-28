import { themeColor } from 'react-native-rapi-ui';
import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context'
import { StyleSheet, View, ScrollView, Image, Linking, TouchableOpacity } from 'react-native'

import { MaterialIcons } from '@expo/vector-icons';
import { useIsFocused } from '@react-navigation/native';

import URLs from '@/utils/URLs';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

interface PageDataType {
  email: string,
  contact_1: string,
  contact_2: string
}

const ControlRoonInformation = () => {

  const { authUserData }: any = useAuth();

  const NotificationBox = ({ linking, label, value, icon }: {
    linking: boolean,
    label: string,
    value: string,
    icon: React.JSX.Element
  }) => {
    return (
      <TouchableOpacity
        onPress={() => {
          if (linking) {
            Linking.openURL(`tel:${value}`)
          }
        }}
        style={styles.contentHolder}>
        {icon}
        <View>
          <ThemedText style={styles.label} type='default'>
            {label}
          </ThemedText>
          <ThemedText style={styles.value} type='defaultSemiBold'>
            {value}
          </ThemedText>
        </View>
      </TouchableOpacity>
    )
  }

  const [PageLoading, SetPageLoading] = useState<boolean>(true);
  const [PageError, SetPageError] = useState<boolean>(false);
  const [PageData, SetPageData] = useState<PageDataType>({
    email: '',
    contact_1: '',
    contact_2: ''
  });

  const GetContactInformation = async (): Promise<void> => {
    try {
      SetPageLoading(true);
      SetPageError(false);

      const authKey = authUserData.auth_key;

      const formData = new FormData();
      formData.append('unique_id', authKey);
      console.log(formData)
      const response = await fetch(URLs.api_base_url + "_get_contacts_.php", {
        method: "POST",
        body: formData
      });


      const responseJson = await response.json();
      console.log(responseJson)
      if (responseJson.status != "success") {
        SetPageError(true);
        return;
      }
      SetPageData(responseJson);


    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      SetPageLoading(false);
    }
  }

  const isFocused = useIsFocused()

  useEffect(() => {

    GetContactInformation();

    return () => { }
  }, [isFocused])



  return (
    <SafeAreaView style={styles.SafeAreaView}>
      <LoadingIndicator text={'Loading'} visible={PageLoading} />
      <ScrollView>
        <Image
          style={styles.contactImage}
          source={require("../../assets/images/contact.jpg")}
        />
        <View>
          <NotificationBox
            linking={true}
            icon={<MaterialIcons name="email" size={moderateScale(30)} color="#333" />}
            label={"Toll Free No / टोल फ्री नंबर"}
            value={PageData && PageData.email && PageData.email}
          />
          <NotificationBox
            linking={true}
            icon={<MaterialIcons name="call" size={moderateScale(30)} color="#333" />}
            label={"Telephone / टेलीफ़ोन"}
            value={PageData && PageData.contact_1 && PageData.contact_1}
          />
          <NotificationBox
            linking={true}
            icon={<MaterialIcons name="call" size={moderateScale(30)} color="#333" />}
            label={"Mobile / मोबाइल नंबर"}
            value={PageData && PageData.contact_2 && PageData.contact_2}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default ControlRoonInformation

const styles = StyleSheet.create({
  SafeAreaView: {
    backgroundColor: '#fff',
    flex: 1
  },
  contactImage: {
    width: '100%',
    height: horizontalScale(300),
    objectFit: 'cover'
  },
  contentHolder: {
    display: 'flex',
    alignItems: 'center',
    gap: horizontalScale(16),
    flexDirection: 'row',
    paddingHorizontal: horizontalScale(30),
    marginVertical: verticalScale(12)
  },
  label: {
    color: themeColor.gray500,
    fontSize: moderateScale(14)
  },
  value: {
    color: themeColor.primary600,
    fontSize: moderateScale(16),
    marginTop: verticalScale(2)
  }
})