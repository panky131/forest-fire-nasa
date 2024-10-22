import { Video } from 'expo-av';
import Toast from 'react-native-toast-message';
import { Camera, CameraView } from 'expo-camera';
import React, { useState, useEffect } from 'react';
import { Button, themeColor } from 'react-native-rapi-ui';
import { router, useLocalSearchParams } from 'expo-router';
import { Modal, StyleSheet, TouchableOpacity, View } from 'react-native'

import { useNavigation, useIsFocused } from '@react-navigation/native'

import URLs from '@/utils/URLs';
import { useAuth } from '@/hooks/useAuth';
import { ThemedText } from '@/components/ThemedText';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';

const path = require('path');
const mimetype = require('mimetype');

const SendVideo = () => {

  const Navigation = useNavigation();
  const { authUserData }: any = useAuth();

  const params = useLocalSearchParams();
  const { alert_id } = params;

  const [loading, SetPageLoading] = useState(false);
  const [PageError, SetPageError] = useState(false);

  // states variables
  const [hasAudioPermission, setHasAudioPermission] = useState<boolean | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [loadingText, setLoadingText] = useState<string>("Loading");

  const [camera, setCamera] = useState(null);
  const [record, setRecord] = useState(null);
  // const [type, setType] = useState(Camera.Constants.Type.back);
  const [RecordingStarted, SetRecordingStarted] = useState(false);

  const [CameraModal, SetCameraModal] = useState(false);

  const video = React.useRef(null);
  const [status, setStatus] = React.useState({});

  const closeModal = () => {
    SetCameraModal(false);
  }

  const takeVideo = async () => {
    try {
      if (camera) {
        SetRecordingStarted(true);
        // @ts-ignore
        const data = await camera.recordAsync()
        closeModal();
        setRecord(data.uri);
        SetRecordingStarted(false);
      }
    } catch (error) {
      console.log(error)
    }
  }

  const stopVideo = async () => {
    // @ts-ignore
    camera?.stopRecording();
    SetRecordingStarted(false);
  }

  const getFileName = (uri: string) => {
    return path.basename(uri);
  }
  const getFileMIME = (uri: string) => {
    return mimetype.lookup(uri);
  }

  const handleSend = async () => {
    try {
      SetPageLoading(true);
      setLoadingText('Uploading');
      if (!record) return;

      const capturedVideo = {
        uri: record,
        name: getFileName(record),
        type: getFileMIME(record)
      };

      const _finalData = new FormData();
      _finalData.append('alert_id', alert_id as never);
      _finalData.append('video', capturedVideo as never);
      _finalData.append('mobile', authUserData.mobile_number);

      let url = URLs.api_base_url + "_submit_video.php";
      const response = await fetch(url, {
        method: "POST",
        body: _finalData,
      });

      const resData = await response.json();
      if (resData.status != "success") {
        SetPageError(true);
        return;
      }

      alert("Report Submitted Succesfully");
      setRecord(null);
      router.replace('/');

    } catch (error) {

      console.log(error);
      SetPageError(true);

    } finally {
      SetPageLoading(false);
      setLoadingText('Loading');
    }
  }

  useEffect(() => {
    (async () => {
      const cameraStatus = await Camera.requestCameraPermissionsAsync();
      setHasCameraPermission(cameraStatus.status === 'granted');
      const audioStatus = await Camera.requestMicrophonePermissionsAsync();
      setHasAudioPermission(audioStatus.status === 'granted');

      if (hasCameraPermission === null || hasAudioPermission === null) {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'Camera and Microphone permission is required',
        });
        return () => { }
      }
      if (hasCameraPermission === false || hasAudioPermission === false) {
        Toast.show({
          type: 'error',
          text1: 'Oops!',
          text2: 'Camera and Microphone permission is required',
        });
        return () => { }
      }
    })();
  }, []);

  const isFocused = useIsFocused()

  useEffect(() => {
    SetPageError(false);
    return () => {

    }
  }, [isFocused])



  return (
    <View>
      <LoadingIndicator text={loadingText} visible={loading} />
      <Modal
        onRequestClose={() => SetCameraModal(false)}
        visible={CameraModal} animationType="slide" transparent>
        <View style={styles.modalContainer}>
          <View style={styles.cameraContainer}>
            <CameraView
              ref={ref => setCamera(ref as never)}
              style={styles.fixedRatio}
              mode='video'
              ratio={'16:9'}
              facing={'back'} />
          </View>
          {RecordingStarted &&
            <ThemedText style={{
              paddingHorizontal: horizontalScale(10),
              paddingVertical: verticalScale(10),
              textAlign: 'center',
              color: themeColor.warning600
            }}>
              Recording started for 10 seconds
            </ThemedText>
          }
          <View style={styles.recordButtonContainer}>
            <TouchableOpacity
              onPress={() => {
                if (RecordingStarted) {
                  stopVideo()
                } else {
                  takeVideo();
                }
              }}
              style={styles.buttonOuter}>
              <View style={[styles.recordButton, { backgroundColor: RecordingStarted ? themeColor.danger600 : themeColor.primary700 }]}></View>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      {record &&
        <View style={styles.viewContainer}>
          <Video
            shouldPlay={false}
            ref={video}
            style={styles.video}
            source={{
              uri: record,
            }}
            useNativeControls
            // @ts-ignore
            resizeMode="contain"
            isLooping={false}
            onPlaybackStatusUpdate={status => setStatus(() => status)}
          />
        </View>
      }
      <View style={styles.buttons}>
        <Button
          style={{ paddingHorizontal: horizontalScale(20) }}
          text={'Record Video'}
          onPress={() => {
            // @ts-ignore
            status.isPlaying ? video.current.pauseAsync() : ""
            SetCameraModal(true);
          }}
          status='info'
        />
        {
          record !== null &&
          <Button
            text={'Send'}
            onPress={() =>
              handleSend()
            }
          />
        }
      </View>
      <ThemedText style={styles.uploadLabel}>
        (Upploading video may take longer time than usual.)
      </ThemedText>
    </View>
  )
}

export default SendVideo

const styles = StyleSheet.create({
  viewContainer: {
    padding: horizontalScale(10)
  },
  video: {
    width: '100%',
    // height: verticalScale(300),
    aspectRatio: 9 / 16,
    backgroundColor: 'rgba(0,0,0,.2)',
    borderRadius: moderateScale(4)
  },
  buttons: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: horizontalScale(10),
    paddingTop: verticalScale(20)
  },
  uploadLabel: {
    fontSize: moderateScale(12),
    textAlign: 'center',
    paddingHorizontal: horizontalScale(10),
    marginTop: verticalScale(10),
    color: themeColor.danger600
  },
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
  },
  cameraContainer: {
    padding: horizontalScale(10)
  },
  fixedRatio: {
    width: '100%',
    aspectRatio: 9 / 16
  },
  recordButton: {
    width: horizontalScale(50),
    height: horizontalScale(50),
    // backgroundColor: themeColor.primary600,
    borderRadius: moderateScale(100),
  },
  recordButtonContainer: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  buttonOuter: {
    padding: horizontalScale(2),
    borderColor: themeColor.primary600,
    borderWidth: 2,
    borderRadius: moderateScale(100)
  }
})