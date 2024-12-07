import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { horizontalScale } from '@/utils/Metrics';
import LoadingIndicator from '@/components/designs/LoadingIndicator';
import AskUserForImage from '@/components/designs/NotAFire/AskUserForImage';
import PickedImageHolder from '@/components/designs/NotAFire/PickedImageHolder';
import AreaBurntInput from '@/components/designs/ExistingFireReport/AreaBurntInput';
import SubmitReportButton from '@/components/designs/ExistingFireReport/SubmitReportButton';
import SelectImageButtonHolder from '@/components/designs/NotAFire/SelectImageButtonHolder';
import FireCategorySelect from '@/components/designs/ExistingFireReport/FireCategorySelect';

const ExistingFireReportMCR = () => {

  const [pageLoading, setPageLoading] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState<string>('Loading..');

  const [areaBurntValue, setAreaBurntValue] = useState<string>('');
  const [pickedImage, setPickedImage] = useState<string | undefined>('');
  const [doesUserHasImage, setDoesUserHasImage] = useState<boolean>(false);
  const [selectedFireCategory, setSelectedFireCategory] = useState<string>('');

  const SelectImage = (): React.JSX.Element => {
    return (
      <>
        <PickedImageHolder pickedImage={pickedImage} />
        <SelectImageButtonHolder setPickedImage={setPickedImage} />
      </>
    )
  }

  return (
    <View>
      <LoadingIndicator text={loadingText} visible={pageLoading} />
      <KeyboardAwareScrollView style={styles.scrollView}>

        <AskUserForImage
          setPickedImage={setPickedImage}
          doesUserHasImage={doesUserHasImage}
          setDoesUserHasImage={setDoesUserHasImage} />

        {doesUserHasImage && <SelectImage />}

        <FireCategorySelect
          selectedFireCategory={selectedFireCategory}
          setSelectedFireCategory={setSelectedFireCategory}
        />

        {selectedFireCategory === 'ForestFire' &&
          <AreaBurntInput
            areaBurntValue={areaBurntValue}
            setAreaBurntValue={setAreaBurntValue}
          />}

        <SubmitReportButton
          pickedImage={pickedImage}
          areaBurnt={areaBurntValue}
          setLoadingText={setLoadingText}
          setPageLoading={setPageLoading}
          fireCategory={selectedFireCategory}
        />

      </KeyboardAwareScrollView>
    </View>
  )
}

export default ExistingFireReportMCR

const styles = StyleSheet.create({
  scrollView: {
    paddingHorizontal: horizontalScale(10)
  }
})