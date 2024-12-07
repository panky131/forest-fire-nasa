import { Dispatch, SetStateAction } from "react";
import { StyleSheet, TouchableOpacity } from "react-native";

import { pickSingleImage } from "./functions";
import { ThemedText } from "@/components/ThemedText";
import { moderateScale, verticalScale } from "@/utils/Metrics";

interface ComponentPropType {
  setPickedImage: Dispatch<SetStateAction<string | undefined>>;
}

const SelectImageButtonHolder = ({ setPickedImage }: ComponentPropType) => {

  const selectImageFromDevice = async () => {
    const selectedImage: string | undefined = await pickSingleImage();
    setPickedImage(selectedImage);
  }

  return (
    <TouchableOpacity
      style={styles.selectImageButton}
      onPress={() => selectImageFromDevice()}>
      <ThemedText type='defaultSemiBold' style={styles.buttonText}>
        Select Image
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

export default SelectImageButtonHolder;