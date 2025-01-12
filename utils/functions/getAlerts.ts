import * as SecureStore from 'expo-secure-store';
import { Dispatch, SetStateAction } from "react";

import URLs from "../URLs";
import { AlertsResponseDataType } from "../Types";

interface FilterMapAlertsFunctionsProps {
  setAlertsData: React.Dispatch<React.SetStateAction<AlertsResponseDataType[]>>,
  setPageError: Dispatch<SetStateAction<boolean>>,
  setIsLoading: Dispatch<SetStateAction<boolean>>,
}

const getAuthKey = async (): Promise<string | null> => {
  return await SecureStore.getItemAsync('auth_key');
}

const createFormData = (authKey: string | null): FormData => {
  const formData = new FormData();
  formData.append('unique_id', authKey as never);
  return formData;
}

const fetchAlerts = async (formData: FormData): Promise<Response> => {
  const random = Math.floor(Math.random() * 9999);
  const url = URLs.api_base_url + `get_alerts.php?random=${random}`;

  return await fetch(url, {
    method: "POST",
    body: formData,
    cache: 'no-cache'
  });
}

const getAlertsData = async (args: FilterMapAlertsFunctionsProps):
  Promise<AlertsResponseDataType[] | any> => {
  const { setPageError, setIsLoading } = args;

  try {
    setIsLoading(true);
    setPageError(false);

    const authKey = await getAuthKey();
    const formData = createFormData(authKey);
    const response = await fetchAlerts(formData);
    const responseJson = await response.json();

    if (responseJson.status !== "success") {
      setPageError(true);
      return [];
    }

    console.log(responseJson.alerts);
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
