import { StyleSheet, Image, View, Dimensions, Modal, TouchableOpacity, Text } from 'react-native'
import React, { useEffect, useReducer, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { Button, TextInput, themeColor } from 'react-native-rapi-ui';
import { Camera, CameraView } from 'expo-camera'
import * as Location from 'expo-location';

import { useIsFocused } from '@react-navigation/native'

import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics'
import LoadingIndicator from '@/components/designs/LoadingIndicator'
import { useAuth } from '@/hooks/useAuth'
import URLs from '@/utils/URLs'
import { ThemedText } from '@/components/ThemedText';
import Toast from 'react-native-toast-message';

const path = require('path');
const mimetype = require('mimetype');

const NewFireIncidentPublic = () => {

    const { authUserData } = useAuth();

    const [loadingText, setLoadingText] = useState<string>("Loading");

    const [Remark, SetRemark] = useState<string>("");
    const [Name, SetName] = useState<string>("");
    const [Phone, SetPhone] = useState<string>("");
    const [OTP, SetOTP] = useState<string | null>(null);

    const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
    const [camera, setCamera] = useState(null);
    const [imageUri, setImageUri] = useState(null);
    const { height, width } = Dimensions.get('window');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [otpModal, setOTPModal] = useState(false);
    const [otpSent, setOTPsent] = useState(false);
    const [systemOTP, setSystemOTP] = useState("");

    const [modalVisible, setModalVisible] = useState(false);
    const [loading, SetPageLoading] = useState(false);
    const [PageError, SetPageError] = useState(false);
    const [phoneNumberVerified, SetPhoneNumberVerified] = useState(false);

    const permisionFunction = async () => {
        const cameraPermission = await Camera.requestCameraPermissionsAsync();
        setCameraPermission(cameraPermission.status === 'granted');
        let { status } = await Location.requestForegroundPermissionsAsync();

        if (
            cameraPermission.status !== 'granted' || status !== 'granted'
        ) {
            alert('Permission for Camera And Location access needed.');
            return;
        }

        let location = await Location.getCurrentPositionAsync({});
        setLocation(location);
    };

    const captureImage = async () => {
        // @ts-ignore
        const data = await camera?.takePictureAsync(null);
        setImageUri(data.uri);
        setModalVisible(false);
    }

    const takePicture = async () => {
        setModalVisible(true);
    };

    const getFileName = (uri: string) => {
        return path.basename(uri);
    }
    const getFileMIME = (uri: string) => {
        return mimetype.lookup(uri);
    }

    const VerifyOTP = () => {
        try {
            if (!OTP) return;

            if (OTP == systemOTP) {
                SetPhoneNumberVerified(true);
                setOTPModal(false);
            } else {
                alert("Invalid OTP");
            }

        } catch (error) {
            console.log(error);
            alert("Unable to Verify OTP");
        }
    }

    const SubmitIncident = async () => {
        try {

            if (!Phone || !Name || !Remark || !imageUri) {
                Toast.show({
                    type: 'error',
                    text1: 'Oops!',
                    text2: 'All input fields must be filled out'
                });
                return;
            }
            setLoadingText('Uploading');
            SetPageLoading(true);

            let capturedImage = {
                uri: imageUri,
                name: getFileName(imageUri),
                type: getFileMIME(imageUri)
            };

            const _finalData = new FormData();
            _finalData.append('message', Remark);
            _finalData.append('image', capturedImage as any);
            if (location?.coords.latitude && location?.coords.longitude) {
                _finalData.append('lat', location?.coords.latitude as never);
                _finalData.append('lng', location?.coords.longitude as never);
            } else {
                _finalData.append('lat', 0 as never);
                _finalData.append('lng', 0 as never);
            }
            _finalData.append('mobile', authUserData.mobile_number);
            _finalData.append('type', 'Fire');
            _finalData.append('name', authUserData.user_name);
            _finalData.append('division_id', 'PUBLIC_USER');

            const response = await fetch(URLs.api_base_url + "submit_incident.php", {
                method: "POST",
                body: _finalData,
            });

            const resData = await response.json();
            if (resData.status != "success") {
                SetPageError(true);
                return;
            }

            Toast.show({
                type: 'success',
                text1: 'Done!',
                text2: 'Report Submitted Succesfully'
            });
            setImageUri(null);
            SetRemark("");
            SetName("");
            SetPhone("");
            SetOTP("");

        } catch (error) {

            console.log(error);
            SetPageError(true);

        } finally {
            SetPageLoading(false);
            setLoadingText('Loading');
        }
    }

    const sendOTP = async () => {
        if (phoneNumberVerified) {
            SubmitIncident();
            return;
        }
        if (!Phone) {
            Toast.show({
                type: 'error',
                text1: 'Oops!',
                text2: 'Please enter phone number'
            });
            return;
        }
        if (otpSent) {
            setOTPModal(true);
        } else {
            // send otp using request
            try {
                SetPageLoading(true);

                const data = new FormData();
                data.append('number', Phone);

                const response = await fetch(URLs.api_base_url + "_send_otp.php", {
                    method: "POST",
                    body: data
                })
                const responseJson = await response.json();
                if (responseJson.status != "success") {
                    Toast.show({
                        type: 'error',
                        text1: 'Oops!',
                        text2: 'Some problems occured while sending OTP. (Server Error)'
                    });
                    return;
                }

                console.log(responseJson.otp)
                setSystemOTP(responseJson.otp);
                setOTPModal(true);
                Toast.show({
                    type: 'success',
                    text1: 'Done!',
                    text2: 'OTP sent successfully'
                });

            } catch (error) {
                console.log(error);
                Toast.show({
                    type: 'error',
                    text1: 'Oops!',
                    text2: 'Some problems occured while sending OTP. Please try again'
                });
            } finally {
                SetPageLoading(false);
            }
        }
    }

    useEffect(() => {
        permisionFunction();
        return () => { }
    }, [])


    const isFocused = useIsFocused();

    useEffect(() => {
        SetPageLoading(false);
        SetPageError(false);

        return () => { }
    }, [isFocused])


    return (
        <View>
            <LoadingIndicator text={loadingText} visible={loading} />
            <Modal
                style={{
                    position: "relative",
                    flex: 1,
                    paddingBottom: verticalScale(12)
                }}
                transparent={false}
                animationType="slide"
                visible={modalVisible}
                onRequestClose={() => {
                    setModalVisible(!modalVisible);
                }}
            >
                <View style={{
                    display: 'flex',
                    alignItems: 'center',
                    paddingHorizontal: horizontalScale(10),
                    paddingVertical: verticalScale(10),
                }}>
                    <CameraView
                        ref={(ref: any) => setCamera(ref)}
                        style={{
                            width: '100%',
                            height: '80%',
                            borderRadius: moderateScale(10),

                        }}
                        // ratio={ratio}
                        // @ts-ignore
                        autoFocus={'on'}
                    />
                    <View style={styles.clickBtnOuterContainer}>
                        <TouchableOpacity style={styles.clickBtn}>
                            <TouchableOpacity onPress={() => captureImage()} style={styles.clickBtnInner}></TouchableOpacity>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <Modal
                transparent={true}
                animationType="fade"
                visible={otpModal}
                onRequestClose={() => {
                    setOTPModal(!otpModal);
                }}
            >
                <View
                    style={{
                        backgroundColor: 'rgba(0,0,0,.6)',
                        flex: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <View style={{
                        width: '90%',
                        paddingHorizontal: horizontalScale(15),
                        paddingVertical: verticalScale(15),
                        backgroundColor: '#fff',
                        borderRadius: moderateScale(10)
                    }}>
                        <Text style={{
                            fontWeight: 'bold',
                            fontSize: moderateScale(16),
                            includeFontPadding: false,
                            textAlignVertical: 'center'
                        }}>
                            Enter OTP
                        </Text>
                        <View style={{
                            width: '100%',
                            height: 1,
                            backgroundColor: 'rgba(0,0,0,0.2)',
                            marginVertical: verticalScale(12),
                        }}></View>
                        <TextInput
                            containerStyle={{
                                backgroundColor: 'rgba(0,0,0,.08)'
                            }}
                            keyboardType='number-pad'
                            placeholder="Enter OTP"
                            value={OTP as string}
                            onChangeText={(val) => SetOTP(val)}
                        />
                        <View style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}>
                            <Button
                                onPress={() => VerifyOTP()}
                                style={{
                                    marginTop: verticalScale(15),
                                    paddingHorizontal: horizontalScale(30)
                                }}
                                text='Verify'
                                status='info'
                            />
                        </View>
                    </View>
                </View>
            </Modal>
            <KeyboardAwareScrollView style={styles.scrollView}>
                <View style={styles.inputHolder}>
                    <View>
                        <View>
                            <ThemedText style={styles.remarkText}>
                                Name / नाम
                            </ThemedText>
                            <TextInput
                                placeholder="Enter your name / नाम लिखें"
                                value={Name}
                                onChangeText={(val) => SetName(val)}
                            />
                        </View>
                        <View>
                            <ThemedText style={styles.remarkText}>
                                Mobile number / मोबाइल नंबर
                            </ThemedText>
                            <TextInput
                                placeholder="Enter your mobile number / मोबाइल नंबर लिखें"
                                value={Phone}
                                keyboardType='number-pad'
                                onChangeText={(val) => SetPhone(val)}
                            />
                        </View>
                        <View style={[styles.captureImageBox, {
                            marginTop: verticalScale(10)
                        }]}>
                            <ThemedText style={styles.imageText}>
                                नई आग की फोटो खीचें
                            </ThemedText>
                            <Image
                                // @ts-ignore
                                source={{ uri: imageUri }}
                                style={styles.captureImage}
                            />
                        </View>
                        <View style={styles.chooseBtnHolder}>
                            <Button
                                onPress={() => takePicture()}
                                textStyle={styles.chooseBtn} size='sm' text='Capture Photo \ फोटो खीचें' />
                        </View>
                    </View>
                    <View>
                        <ThemedText type='defaultSemiBold' style={styles.imageText}>
                            Remark / टिप्पणी
                        </ThemedText>
                        <TextInput
                            placeholder="Enter your text / टिप्पणी लिखें"
                            value={Remark}
                            onChangeText={(val) => SetRemark(val)}
                        />
                    </View>
                    <View style={styles.submitBtnHolder}>
                        <Button
                            onPress={() => sendOTP()}
                            textStyle={styles.submitBtn} text='Report fire \ वनाग्नि की सूचना दें' status='info' />
                    </View>
                </View>
            </KeyboardAwareScrollView>
        </View>
    )
}

export default NewFireIncidentPublic

const styles = StyleSheet.create({
    headerImage: {
        width: '100%',
        height: verticalScale(200),
        borderRadius: moderateScale(5),
        marginTop: verticalScale(10)
    },
    scrollView: {
        paddingHorizontal: horizontalScale(10)
    },
    remarkText: {
        marginTop: verticalScale(20),
        marginBottom: verticalScale(5),
        fontSize: moderateScale(15),
    },
    inputHolder: {
        marginTop: verticalScale(-5)
    },
    captureImageBox: {
        width: '100%',
        height: verticalScale(320),
        backgroundColor: 'rgba(0,0,0,.1)',
        position: 'relative',
        borderRadius: moderateScale(5),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
    },
    imageText: {
        position: 'absolute',
        color: 'rgba(0,0,0,.7)',
        fontSize: moderateScale(15),
    },
    captureImage: {
        width: '100%',
        height: '100%',
        zIndex: 1,
        position: 'absolute'
    },
    chooseBtnHolder: {
        display: 'flex',
        flexDirection: 'row',
        marginVertical: verticalScale(10),
        alignItems: 'center',
        justifyContent: 'center'
    },
    chooseBtn: {
        paddingHorizontal: horizontalScale(15),
        paddingVertical: verticalScale(5)
    },
    submitBtnHolder: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(10)
    },
    submitBtn: {
        minWidth: horizontalScale(200),
        textAlign: 'center'
    },
    clickBtnOuterContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: verticalScale(10)
    },
    clickBtn: {
        borderColor: themeColor.info600,
        borderWidth: 2,
        padding: 3,
        borderRadius: 100
    },
    clickBtnInner: {
        width: 50,
        height: 50,
        backgroundColor: themeColor.info600,
        borderRadius: 100
    }
})