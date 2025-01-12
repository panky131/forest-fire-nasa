import * as SecureStore from 'expo-secure-store';
import { Dispatch, SetStateAction } from "react";

import URLs from "../URLs";
import { AlertsDurationType, AlertsResponseDataType } from "../Types";

interface FilterMapAlertsFunctionsProps {
  setPageError: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
  alertsDuration: AlertsDurationType
}

const getAuthKey = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('auth_key');
}

const createFormData = (authKey: string | null): FormData => {
  const formData = new FormData();
  formData.append('unique_id', authKey as never);
  return formData;
}

const fetchAlerts = async (formData: FormData, alertsDuration: AlertsDurationType): Promise<Response> => {
  const random = Math.floor(Math.random() * 9999);
  const url = URLs.api_base_url + `get_alerts.php?random=${random}&duration=${alertsDuration}`;

  return await fetch(url, {
    method: "POST",
    body: formData,
    cache: 'no-cache'
  });
}

const getAlertsData = async (args: FilterMapAlertsFunctionsProps):
  Promise<AlertsResponseDataType[] | any> => {
  const { setPageError, setIsLoading, alertsDuration } = args;

  try {
    setIsLoading(true);
    setPageError(false);

    const authKey = await getAuthKey();
    const formData = createFormData(authKey);
    const response = await fetchAlerts(formData, alertsDuration);
    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      setPageError(true);
      return [];
    }

    return responseJson.alerts;

  } catch (error) {
    console.log(error);
    setPageError(true);
    return [];

  } finally {
    setIsLoading(false);
  }
}

export { getAlertsData };
