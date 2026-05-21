/**
 * Some PHP endpoints read `notificationToken`, others `notification_token`.
 * Send both with the same value (including empty string in Expo Go).
 */
export function appendNotificationTokenFields(
  formData: FormData,
  token: string
): void {
  formData.append("notificationToken", token);
  formData.append("notification_token", token);
}
