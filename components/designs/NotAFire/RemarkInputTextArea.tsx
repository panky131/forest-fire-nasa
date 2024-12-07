import { Dispatch, SetStateAction } from 'react';
import { StyleSheet, View } from 'react-native';
import { TextInput } from 'react-native-rapi-ui';

import { ThemedView } from '@/components/ThemedView';
import { verticalScale } from '@/utils/Metrics';

interface ComponentPropType {
  remarkInput: string,
  setRemarkInput: Dispatch<SetStateAction<string>>
}

const RemarkInputTextArea = ({ remarkInput, setRemarkInput }: ComponentPropType) => {
  return (
    <ThemedView style={styles.inputTextAreaContainer}>
      <TextInput
        multiline
        numberOfLines={4}
        placeholder="Remark"
        value={remarkInput}
        onChangeText={(value: string) => setRemarkInput(value)}
      />
    </ThemedView>
  )
}

export default RemarkInputTextArea

const styles = StyleSheet.create({
  inputTextAreaContainer: {
    marginTop: verticalScale(20),
    overflow: 'hidden'
  }
})