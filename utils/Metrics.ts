import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

const guidelineBaseWidth: number = 375;
const guidelineBaseHeight: number = 812;

const horizontalScale = (size: number): number => (width / guidelineBaseWidth) * size;
const verticalScale = (size: number): number => (height / guidelineBaseHeight) * size;
const moderateScale = (size: number, factor = 0.5): number => size + (horizontalScale(size) - size) * factor;

export { horizontalScale, verticalScale, moderateScale };