import Toast from 'react-native-toast-message';
import { Dispatch, SetStateAction } from 'react';
import { StyleSheet, TouchableOpacity } from 'react-native';

import URLs from '@/utils/URLs';
import Color from '@/utils/Color';
import { useAuth } from '@/hooks/useAuth';
import { sendFormData } from '@/utils/SendFormData';
import { ThemedText } from '@/components/ThemedText';
import { horizontalScale, moderateScale, verticalScale } from '@/utils/Metrics';
import { useRouter } from 'expo-router';

const path = require('path');
const mimetype = require('mimetype');

interface ComponentPropType {
  pickedImage: string | undefined,
  fireCategory: string,
  areaBurnt: string,
  setPageLoading: Dispatch<SetStateAction<boolean>>,
  setLoadingText: Dispatch<SetStateAction<string>>,
  alert_id: string | string[],
  setSelectedFireCategory: Dispatch<SetStateAction<string>>,
  setAreaBurntValue: Dispatch<SetStateAction<string>>,
  setPickedImage: Dispatch<SetStateAction<string | undefined>>
}
interface fileFormat {
  uri: string | undefined,
  name: string,
  type: string
}

const getFileName = (uri: string | undefined) => {
  return path.basename(uri);
}

const getFileMIME = (uri: string | undefined) => {
  return mimetype.lookup(uri);
}

const SubmitReportButton = (props: ComponentPropType) => {

  const authData: any = useAuth();
  const { pickedImage, fireCategory, areaBurnt, setPageLoading, setLoadingText, alert_id,
    setSelectedFireCategory, setAreaBurntValue, setPickedImage
  }
    = props;

  const router = useRouter();

  const getPickedImageInFormat = (): fileFormat => {
    const incidentImageFormat: fileFormat = {
      uri: pickedImage,
      name: getFileName(pickedImage),
      type: getFileMIME(pickedImage)
    };

    return incidentImageFormat;
  }

  const getFormData = (): FormData => {
    const incidentImage = pickedImage ? getPickedImageInFormat() : '';
    const userData = authData.authUserData;

    const formData = new FormData();
    formData.append('area_burnt', areaBurnt);
    formData.append('fireCategory', fireCategory);
    formData.append('alert_id', alert_id as string);
    formData.append('auth_key', userData.auth_key);
    formData.append('user_name', userData.user_name);
    formData.append('division_id', userData.division_id);
    formData.append('mobile_number', userData.mobile_number);
    formData.append('incident_image', incidentImage as any);

    return formData;
  }

  const handleSubmit = async (): Promise<void> => {
    if (!isInputValid(fireCategory)) {
      showError('Required input field must be filled out.');
      return;
    }

    try {
      setPageLoading(true);
      setLoadingText('Uploading Data..');

      const formData = getFormData();
      const URL = URLs.api_base_url + '_close_fire.php';
      const submitResponse: boolean = await sendFormData({ data: formData, url: URL });

      if (!submitResponse) {
        showError('Unable to send data. Please try again');
        return;
      }

      Toast.show({
        type: 'success',
        text1: 'Done',
        text2: 'Report submitted succesfully. Changes may take some time to reflect.'
      });

      setSelectedFireCategory('');
      setAreaBurntValue('');
      setPickedImage('');
      router.push('/Dashboard');

    } catch (error) {
      console.log(error);
      showError('Unable to send data. Please try again');


    } finally {
      setPageLoading(false);
      setLoadingText('Loading..')
    }
  }

  return (
    <TouchableOpacity onPress={handleSubmit} style={styles.submitButton}>
      <ThemedText type='defaultSemiBold' style={styles.submitButtonText}>
        Submit Report
      </ThemedText>
    </TouchableOpacity>
  )
}

const showError = (message: string) => {
  Toast.show({
    type: 'error',
    text1: 'Oops!',
    text2: message
  });
}

const isInputValid = (text: string | undefined): boolean => {
  if (!text || text === '') {
    return false;
  }

  return true;
}

export default SubmitReportButton

const styles = StyleSheet.create({
  submitButton: {
    marginTop: verticalScale(20),
    width: horizontalScale(250),
    marginLeft: 'auto',
    marginRight: 'auto',
    paddingVertical: verticalScale(12),
    backgroundColor: Color.ComponentColorCyan,
    borderRadius: moderateScale(100)
  },
  submitButtonText: {
    color: '#fff',
    fontSize: moderateScale(12),
    textAlign: 'center'
  }
})