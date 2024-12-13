import { Image, StyleSheet } from "react-native";

import { ThemedText } from "@/components/ThemedText";
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

        {pickedImage ?
          <Image style={styles.selectedImage}
            source={{ uri: pickedImage }} alt='Picked Image' />
          :
          <SelectImageBGLabel />
        }

      </ThemedView>
    </ThemedView>
  )
}

const SelectImageBGLabel = () => {
  return (
    <ThemedView style={styles.selectImageBgHolder}>
      <ThemedText type="default">
        घटना की फोटो का चयन करें
      </ThemedText>
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
  imageContainer: {
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: moderateScale(20),
    marginTop: verticalScale(10),
    overflow: 'hidden',
    position: 'relative'
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: moderateScale(2),
    position: 'absolute',
  },
  selectImageBgHolder: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

export default PickedImageHolder;