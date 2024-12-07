import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

const pickSingleImage = async (): Promise<string | undefined> => {
  try {

    let result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
      mediaTypes: ImagePicker.MediaTypeOptions.Images
    });

    if (!result.canceled) {
      return result.assets[0].uri;
    }

  } catch (error) {
    console.log(error);
    Toast.show({
      type: 'error',
      text1: 'Oops!',
      text2: 'Unable to select image from your device. Please try again'
    });

    return '';
  }
};

export { pickSingleImage };