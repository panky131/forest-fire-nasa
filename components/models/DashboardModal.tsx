import React from "react";
import PropTypes from "prop-types";
import { Button } from "react-native-rapi-ui";
import { View, Modal, StyleSheet } from "react-native";

import URLs from "@/utils/URLs";
import { horizontalScale, verticalScale } from "@/utils/Metrics";

const styles = StyleSheet.create({
    container: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
    },
    content: {
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: horizontalScale(64),
        paddingVertical: verticalScale(30),
        borderRadius: 16,
        gap: horizontalScale(15),
        display: "flex",
        flexDirection: "row",
    },
});

const DashboardModal = ({
    visible,
    SetModalVisible,
    SelectedFire,
    handleMarkerClickFun,
    Navigation,
    status,
    getDataFunction,
    authUserData,
    SetPageError,
    SelectedCoordinates,
    setIsLoading
}: any) => {


    const setToBeingheld = async (alert_id: string | number) => {
        try {

            setIsLoading(true);
            console.log(alert_id);
            console.log(authUserData.auth_key);
            console.log(authUserData.mobile_number)

            const formData = new FormData();
            formData.append('alert_id', alert_id as never);
            formData.append('auth_key', authUserData.auth_key);
            formData.append('phone_number', authUserData.mobile_number);
            console.log(authUserData)
            const response = await fetch(URLs.api_base_url + "changeAlertStatus.php", {
                method: "POST",
                body: formData
            });

            const responseJson = await response.json();
            if (responseJson.status != "success") {
                SetPageError(true);
                return;
            }
            getDataFunction();


        } catch (error) {

            console.log(error);
            SetPageError(true);

        } finally {
            setIsLoading(false);
        }
    }


    return (
        <Modal
            onRequestClose={() => SetModalVisible(false)}
            visible={visible}
            animationType="fade"
            transparent
        >
            <View style={styles.container}>
                <View style={styles.content}>
                    {status == "active" ? (
                        <Button
                            onPress={() => {
                                setToBeingheld(SelectedFire);
                                SetModalVisible(false);
                            }}
                            text="I am on it"
                            status="primary"
                        />
                    ) : (
                        <>
                            <Button
                                onPress={() => {
                                    Navigation.navigate("SendVideo", {
                                        alert_id: SelectedFire,
                                    });
                                    SetModalVisible(false);
                                }}
                                text="Send Video"
                                status="primary"
                            />
                            <Button
                                onPress={() => {
                                    handleMarkerClickFun(SelectedFire);
                                    SetModalVisible(false);
                                }}
                                text="Close Fire"
                                status="success"
                            />
                        </>
                    )}
                </View>
            </View>
        </Modal>
    )
}

DashboardModal.propTypes = {
    visible: PropTypes.bool.isRequired,
};

export default DashboardModal;
