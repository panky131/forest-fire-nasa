import React from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import Color from "@/utils/Color";
import { horizontalScale, moderateScale, verticalScale } from "@/utils/Metrics";

type Props = {
  message: string;
  httpStatus: number | null;
  apiStatus: string | null;
  /** Truncated raw body from the server (for debugging). */
  responsePreview: string | null;
  onRetry: () => void;
};

const AlertsApiStatusBanner = ({
  message,
  httpStatus,
  apiStatus,
  responsePreview,
  onRetry,
}: Props) => {
  const meta =
    httpStatus != null || apiStatus != null
      ? [httpStatus != null ? `HTTP ${httpStatus}` : null, apiStatus != null ? `status: ${apiStatus}` : null]
          .filter(Boolean)
          .join(" · ")
      : null;

  return (
    <View style={styles.wrap}>
      <ThemedText type="defaultSemiBold" style={styles.title}>
        Alerts could not be loaded
      </ThemedText>
      <ThemedText type="default" style={styles.body}>
        {message}
      </ThemedText>
      {meta ? (
        <ThemedText type="default" style={styles.meta}>
          {meta}
        </ThemedText>
      ) : null}
      {responsePreview ? (
        <>
          <ThemedText type="defaultSemiBold" style={styles.previewLabel}>
            API response (preview)
          </ThemedText>
          <ScrollView style={styles.previewScroll} nestedScrollEnabled>
            <ThemedText type="default" style={styles.previewText} selectable>
              {responsePreview}
            </ThemedText>
          </ScrollView>
        </>
      ) : null}
      <TouchableOpacity onPress={onRetry} style={styles.btn}>
        <ThemedText type="defaultSemiBold" style={styles.btnText}>
          Retry
        </ThemedText>
      </TouchableOpacity>
    </View>
  );
};

export default AlertsApiStatusBanner;

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: "#fff3cd",
    borderColor: "#ffc107",
    borderWidth: 1,
    marginHorizontal: horizontalScale(12),
    marginTop: verticalScale(8),
    marginBottom: verticalScale(4),
    padding: horizontalScale(12),
    borderRadius: moderateScale(8),
  },
  title: {
    color: "#856404",
    marginBottom: verticalScale(6),
    fontSize: moderateScale(15),
  },
  body: {
    color: "#333",
    fontSize: moderateScale(14),
    marginBottom: verticalScale(4),
  },
  meta: {
    color: Color.SpashScreenText,
    fontSize: moderateScale(12),
    marginBottom: verticalScale(10),
    opacity: 0.85,
  },
  previewLabel: {
    color: "#333",
    fontSize: moderateScale(12),
    marginBottom: verticalScale(4),
  },
  previewScroll: {
    maxHeight: verticalScale(160),
    marginBottom: verticalScale(10),
    backgroundColor: "#f8f9fa",
    borderRadius: moderateScale(6),
    padding: horizontalScale(8),
    borderWidth: 1,
    borderColor: "#dee2e6",
  },
  previewText: {
    fontSize: moderateScale(11),
    fontFamily: "monospace",
    color: "#212529",
  },
  btn: {
    alignSelf: "flex-start",
    backgroundColor: Color.SpashScreenText,
    paddingVertical: verticalScale(8),
    paddingHorizontal: horizontalScale(16),
    borderRadius: moderateScale(20),
  },
  btnText: {
    color: "#fff",
    fontSize: moderateScale(13),
  },
});
