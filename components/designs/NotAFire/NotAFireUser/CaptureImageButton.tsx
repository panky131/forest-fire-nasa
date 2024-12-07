import { Dispatch, SetStateAction } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { moderateScale, verticalScale } from "@/utils/Metrics";

interface ComponentPropType {
  setIsCaptureImageModalOpen: Dispatch<SetStateAction<boolean>>;
}

const CaptureImageButton = ({ setIsCaptureImageModalOpen }: ComponentPropType) => {

  return (
    <TouchableOpacity
      onPress={() => setIsCaptureImageModalOpen(true)}
      style={styles.selectImageButton}>
      <ThemedText type='defaultSemiBold' style={styles.buttonText}>
        Capture Image
      </ThemedText>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  selectImageButton: {
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '90%',
    backgroundColor: '#333',
    paddingVertical: verticalScale(10),
    marginTop: verticalScale(10),
    borderRadius: moderateScale(100)
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: moderateScale(12)
  }
});

export default CaptureImageButton;