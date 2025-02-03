import { StyleSheet, View } from "react-native";
import { TextInput } from "react-native-rapi-ui";
import { Dispatch, SetStateAction } from "react";

import { ThemedText } from "@/components/ThemedText";
import { moderateScale, verticalScale } from "@/utils/Metrics";

interface ComponentPropType {
  areaBurntValue: string,
  setAreaBurntValue: Dispatch<SetStateAction<string>>
}

const AreaBurntInput = (props: ComponentPropType) => {

  const { areaBurntValue, setAreaBurntValue } = props;

  return (
    <View>
      <ThemedText style={styles.inputLabelText}>
        Burnt Area/ जला हुआ क्षेत्रफल
      </ThemedText>
      <TextInput
        placeholder="Enter your text"
        value={areaBurntValue}
        onChangeText={(val: string) => setAreaBurntValue(val)}
      />
    </View>
  )
}

export default AreaBurntInput;

const styles = StyleSheet.create({
  inputLabelText: {
    marginTop: verticalScale(20),
    marginBottom: verticalScale(5),
    fontSize: moderateScale(15),
  },
})