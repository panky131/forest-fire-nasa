import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Href, useRouter } from "expo-router";

import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

export type DashboardCategory = "fire" | "nearForest";

type Props = {
  active: DashboardCategory;
  onSelectFire: () => void;
};

const DashboardCategoryNav = ({ active, onSelectFire }: Props) => {
  const router = useRouter();

  return (
    <View style={styles.row}>
      <TouchableOpacity
        onPress={onSelectFire}
        style={[styles.btn, active === "fire" && styles.btnActiveFire]}
        activeOpacity={0.85}
      >
        <Text style={[styles.btnText, active === "fire" && styles.btnTextActive]}>
          Fire Alert
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(needAuth)/(protected)/FreeFire" as Href)}
        style={[styles.btn, active === "nearForest" && styles.btnActiveNearForest]}
        activeOpacity={0.85}
      >
        <Text
          style={[styles.btnText, active === "nearForest" && styles.btnTextActive]}
          numberOfLines={2}
        >
          Near Forest Alerts
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.push("/(needAuth)/(protected)/Weather" as Href)}
        style={styles.btn}
        activeOpacity={0.85}
      >
        <Text style={styles.btnText} numberOfLines={1}>
          Weather
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default DashboardCategoryNav;

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: horizontalScale(6),
    marginBottom: verticalScale(6),
  },
  btn: {
    flex: 1,
    minHeight: verticalScale(40),
    paddingVertical: verticalScale(6),
    paddingHorizontal: horizontalScale(4),
    borderRadius: moderateScale(10),
    borderWidth: 2,
    borderColor: "rgba(0,0,0,0.35)",
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  btnActiveFire: {
    backgroundColor: "#c1121f",
    borderColor: "#9d0208",
  },
  btnActiveNearForest: {
    backgroundColor: "#b8860b",
    borderColor: "#8b6914",
  },
  btnText: {
    fontSize: moderateScale(10),
    fontFamily: "NotoSans_SemiBold",
    color: "rgba(0,0,0,0.85)",
    textAlign: "center",
  },
  btnTextActive: {
    color: "#fff",
    fontFamily: "NotoSans_Bold",
  },
});
