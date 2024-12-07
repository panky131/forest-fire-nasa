import { Image, StyleSheet } from "react-native";

import { ThemedView } from "@/components/ThemedView";
import { generateBoxShadowStyle } from "@/utils/UI_components";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

interface componentPropType {
  pickedImage: string | undefined
}

const PickedImageHolder = ({ pickedImage }: componentPropType) => {
  return (
    <ThemedView style={styles.componentContainer}>
      <ThemedView style={[styles.imageContainer, boxShadow]}>

        {pickedImage && <Image
          style={styles.selectedImage}
          source={{ uri: pickedImage }} alt='Picked Image' />
        }

      </ThemedView>
    </ThemedView>
  )
}

const boxShadow = generateBoxShadowStyle({
  xOffset: -2,
  yOffset: 4,
  shadowColorIos: '#171717',
  shadowOpacity: 0.2,
  shadowRadius: 3,
  elevation: 4,
  shadowColorAndroid: '#171717'
});

const styles = StyleSheet.create({
  componentContainer: {
    paddingHorizontal: horizontalScale(6),
    backgroundColor: 'transparent'
  },
  selectedImage: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: moderateScale(2),
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: moderateScale(20),
    marginTop: verticalScale(10),
    overflow: 'hidden',
  }
});

export default PickedImageHolder;