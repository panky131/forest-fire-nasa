import { Platform } from "react-native";

interface functionPropType {
  xOffset: number,
  yOffset: number,
  shadowColorIos: string,
  shadowOpacity: number,
  shadowRadius: number,
  elevation: number,
  shadowColorAndroid: string
}

const generateBoxShadowStyle = (
  { xOffset,
    yOffset,
    shadowColorIos,
    shadowOpacity,
    shadowRadius,
    elevation,
    shadowColorAndroid }: functionPropType
) => {

  if (Platform.OS === 'ios') {
    return {
      shadowColor: shadowColorIos,
      shadowOffset: { width: xOffset, height: yOffset },
      shadowOpacity,
      shadowRadius,
    };
  }

  return {
    elevation,
    shadowColor: shadowColorAndroid,
  };

};

export { generateBoxShadowStyle };