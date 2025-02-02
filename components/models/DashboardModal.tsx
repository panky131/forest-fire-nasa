import React from "react";
import PropTypes from "prop-types";
import * as Location from "expo-location";
import haversine from "haversine-distance";
import { Button } from "react-native-rapi-ui";
import { View, Modal, StyleSheet } from "react-native";

import URLs from "@/utils/URLs";
import { useAuth } from "@/hooks/useAuth";
import { AlertsResponseDataType } from "@/utils/Types";
import { horizontalScale, verticalScale } from "@/utils/Metrics";

interface DashboardModalProps {
  visible: boolean;
  SetModalVisible: (visible: boolean) => void;
  SelectedFire: AlertsResponseDataType;
  handleMarkerClickFun: (fire: string | number) => void;
  Navigation: any;
  status: string;
  getDataFunction: () => void;
  authUserData: {
    auth_key: string;
    mobile_number: string;
    user_type: string;
  };
  SetPageError: (error: boolean) => void;
  SelectedCoordinates: any;
  setIsLoading: (loading: boolean) => void;
}

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

const DashboardModal: React.FC<DashboardModalProps> = ({
  visible,
  SetModalVisible,
  SelectedFire,
  handleMarkerClickFun,
  Navigation,
  status,
  getDataFunction,
  authUserData,
  SetPageError,
  setIsLoading
}) => {

  const userData: any = useAuth();
  const isVolunteer = userData?.authUserData?.user_type === "end";

  const checkLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access location was denied");
      return false;
    }
    return true;
  };

  const checkDistance = async (lat: string, lng: string): Promise<boolean> => {
    const location = await Location.getCurrentPositionAsync({});
    const { latitude: userLatitude, longitude: userLongitude } = location.coords;

    const distance = haversine(
      { latitude: parseFloat(lat), longitude: parseFloat(lng) },
      { latitude: userLatitude, longitude: userLongitude }
    );

    if (distance > 1000) {
      alert("You must be within 500 meters to proceed.");
      return false;
    }
    return true;
  };

  const submitAlertStatusChange = async (alertId: string): Promise<boolean> => {
    const formData = new FormData();
    formData.append("alert_id", alertId as never);
    formData.append("auth_key", authUserData.auth_key);
    formData.append("phone_number", authUserData.mobile_number);

    const response = await fetch(`${URLs.api_base_url}changeAlertStatus.php`, {
      method: "POST",
      body: formData,
    });

    const responseJson = await response.json();
    return responseJson.status === "success";
  };

  const setToBeingheld = async (selectedFire: AlertsResponseDataType) => {
    try {
      setIsLoading(true);
      const { alert_id, lat, lng }: AlertsResponseDataType = selectedFire;

      const hasPermission = await checkLocationPermission();
      if (!hasPermission) return;

      const isWithinRange = await checkDistance(lat as string, lng as string);
      if (!isWithinRange) return;

      const success = await submitAlertStatusChange(alert_id as any);
      if (!success) {
        SetPageError(true);
        return;
      }

      getDataFunction();
    } catch (error) {
      console.error(error);
      SetPageError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotAFire = () => {
    const screenName = authUserData.user_type === 'mcr' ? 'NotAFireMCR' : 'NotAFire';
    SetModalVisible(false);
    Navigation.navigate(screenName, {
      alert_id: SelectedFire.alert_id,
    });
  };

  const handleSendVideo = () => {
    Navigation.navigate("SendVideo", {
      alert_id: SelectedFire.alert_id,
    });
    SetModalVisible(false);
  };

  const handleCloseFire = () => {
    handleMarkerClickFun(SelectedFire.alert_id);
    SetModalVisible(false);
  };

  const renderActiveButtons = () => (
    <>
      <Button
        onPress={() => {
          setToBeingheld(SelectedFire);
          SetModalVisible(false);
        }}
        text="I am on it"
        status="primary"
      />
      <Button
        onPress={handleNotAFire}
        text="Not forest fire"
        status="warning"
      />
    </>
  );

  const renderInactiveButtons = () => (
    <>
      <Button
        onPress={handleSendVideo}
        text="Send Video"
        status="primary"
      />
      {
        !isVolunteer &&
        <Button
          onPress={handleCloseFire}
          text="Close Fire"
          status="success"
        />
      }
    </>
  );

  return (
    <Modal
      onRequestClose={() => SetModalVisible(false)}
      visible={visible}
      animationType="fade"
      transparent
    >
      <View style={styles.container}>
        <View style={styles.content}>
          {status === "active" ? renderActiveButtons() : renderInactiveButtons()}
        </View>
      </View>
    </Modal>
  );
};

DashboardModal.propTypes = {
  visible: PropTypes.bool.isRequired,
};

export default DashboardModal;
