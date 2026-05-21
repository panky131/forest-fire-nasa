import Constants, { ExecutionEnvironment } from "expo-constants";

/**
 * Only load `expo-notifications` in native builds where push is supported.
 * - `storeClient` = Expo Go → defer (Android push removed in Expo Go SDK 53+; avoids crashes).
 * - `bare` = dev client / prebuild; `standalone` = store build → allow loading the module.
 */
export const shouldDeferExpoNotifications = (): boolean => {
  const env = Constants.executionEnvironment;
  return (
    env !== ExecutionEnvironment.Bare && env !== ExecutionEnvironment.Standalone
  );
};
