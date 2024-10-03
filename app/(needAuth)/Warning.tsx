import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useNavigation, } from '@react-navigation/native';
import { themeColor } from 'react-native-rapi-ui';

import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import URLs from '@/utils/URLs';
import { ThemedText } from '@/components/ThemedText';

interface warningPropType {
  id: number,
  title: string,
  description: string,
  datetime: string,
  image: string
}

const Warning = () => {

  const [loading, SetPageLoading] = useState(false);
  const [warnings, setWarnings] = useState<warningPropType[]>([]);
  const Navigation = useNavigation();

  const GetWarnings = async () => {
    try {
      SetPageLoading(true);

      const formData = new FormData();
      formData.append('unique_id', 'test_id');
      formData.append('user_id', 'unloggedin_user');

      const res = await fetch(URLs.api_base_url + "get_warnings.php", {
        method: "POST",
        body: formData,
      });

      const responseJson = await res.json();

      setWarnings(responseJson.warnings);

    } catch (error) {
      console.log(error);
    } finally {
      SetPageLoading(false);
    }
  }

  useEffect(() => {
    GetWarnings();

    return () => { }
  }, [Navigation.isFocused])


  return (
    <View style={styles.SafeAreaView}>
      <LoadingIndicator text={'Loading Data'} visible={loading} />
      <ScrollView>
        {warnings && warnings.length == 0 ?
          <ThemedText type='defaultSemiBold' style={{
            textAlign: 'center'
          }}>No warnings.</ThemedText> : ""
        }
        {warnings && warnings.map((props, index) => {
          return (
            <View key={index} style={styles.card}>
              <ThemedText style={styles.textHolder}>
                ID: {" "}
                <ThemedText style={styles.textValue}>{props.id}</ThemedText>
              </ThemedText>
              <ThemedText style={styles.textHolder}>
                Title: {" "}
                <ThemedText style={styles.textValue}>{props.title}</ThemedText>
              </ThemedText>
              <ThemedText style={styles.textHolder}>
                Description: {" "}
                <ThemedText style={styles.textValue}>{props.description}</ThemedText>
              </ThemedText>
              <ThemedText style={styles.textHolder}>
                Timestamp: {" "}
                <ThemedText style={styles.textValue}>{props.datetime}</ThemedText>
              </ThemedText>
              <View style={styles.divider} />
              <Image
                style={styles.alertImage}
                source={{
                  uri: props.image
                }} />
            </View>
          )
        })}
      </ScrollView>
    </View>
  )
}

export default Warning

const styles = StyleSheet.create({
  SafeAreaView: {
    paddingHorizontal: horizontalScale(10),
    paddingVertical: verticalScale(10)
  },
  card: {
    backgroundColor: '#fff',
    paddingVertical: verticalScale(10),
    paddingHorizontal: horizontalScale(10),
    borderRadius: moderateScale(5)
  },
  textHolder: {
    fontSize: moderateScale(14),
    marginTop: verticalScale(6),
    includeFontPadding: false,
    textAlignVertical: 'center'
  },
  textValue: {
    fontWeight: 'bold',
    color: themeColor.info700
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(0,0,0,.1)',
    marginVertical: verticalScale(10)
  },
  alertImage: {
    aspectRatio: 16 / 12,
    objectFit: 'contain',
  }
})