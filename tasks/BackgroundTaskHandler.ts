import Toast from 'react-native-toast-message';
import * as FileSystem from 'expo-file-system/legacy';
import * as TaskManager from 'expo-task-manager';
import NetInfo from '@react-native-community/netinfo';
import * as BackgroundFetch from 'expo-background-fetch';

import URLs from '@/utils/URLs';
import { checkIfDbExists } from '@/utils/sqlite/SQLiteDBLocals';
import { tbl_existing_fire_report, tbl_fire_incidents } from '@/utils/sqlite/SQLiteDBSchema';
import { deleteRow, executeSQLiteOperation, ExistingFireReportType, FireIncidentsType } from '@/utils/sqlite/SQLiteFunctions';

const path = require('path');
const mimetype = require('mimetype');

interface fileFormat {
  uri: string,
  name: string,
  type: string
}

const getFileName = (uri: string) => {
  return path.basename(uri);
}

const getFileMIME = (uri: string) => {
  return mimetype.lookup(uri);
}

let isUploading = false;

const prepareAndUploadIncidentData = async ({ incident_id }: { incident_id: number }): Promise<boolean | FireIncidentsType> => {
  try {
    const selectIncidentDataQuery = `SELECT * FROM ${tbl_fire_incidents.tbl_name} WHERE id = ${incident_id}`;
    const incidentDataSet: FireIncidentsType[] = await executeSQLiteOperation({ query: selectIncidentDataQuery });

    const targetedIncidentData: FireIncidentsType = incidentDataSet[0];

    const storedImageURI: string = targetedIncidentData.image;

    const fileInfo = await FileSystem.getInfoAsync(storedImageURI);
    if (!fileInfo.exists) {
      throw new Error(`File at ${storedImageURI} does not exist`);
    }
    const capturedImageFormat: fileFormat = {
      uri: storedImageURI,
      name: getFileName(storedImageURI),
      type: getFileMIME(storedImageURI)
    };

    const formDataToUpload = new FormData();
    formDataToUpload.append('message', targetedIncidentData.message);
    formDataToUpload.append('image', capturedImageFormat as any);
    formDataToUpload.append('lat', targetedIncidentData.lat);
    formDataToUpload.append('lng', targetedIncidentData.lng);
    formDataToUpload.append('mobile', targetedIncidentData.mobile);
    formDataToUpload.append('type', targetedIncidentData.type);
    formDataToUpload.append('name', targetedIncidentData.name);
    formDataToUpload.append('division_id', targetedIncidentData.division_id);

    const urlToUpload: string = `${URLs.api_base_url}submit_incident.php`;
    const uploadResponse = await fetch(urlToUpload, {
      method: 'POST',
      body: formDataToUpload
    });

    const responseJSON = await uploadResponse.json();
    if (uploadResponse.status !== 200) {
      Toast.show({
        type: 'success',
        text1: 'Oops!',
        text2: responseJSON?.error
      })
      return false;
    }

    return targetedIncidentData;

  } catch (error) {
    console.log(error);
    return false;

  }
}

const prepareAndUploadExisitingFire = async ({ existingReportID }: {
  existingReportID: number
}): Promise<boolean | ExistingFireReportType> => {
  try {
    const selectExisitingReportQuery = `SELECT * FROM ${tbl_existing_fire_report.tbl_name} WHERE id = ${existingReportID}`;
    const existingReportDataSet: ExistingFireReportType[] = await executeSQLiteOperation({ query: selectExisitingReportQuery });

    const targetedExistingReport: ExistingFireReportType = existingReportDataSet[0];
    const storedImageURI: string = targetedExistingReport.image;

    const fileInfo = await FileSystem.getInfoAsync(storedImageURI);
    if (!fileInfo.exists) {
      throw new Error(`File at ${storedImageURI} does not exist`);
    }

    const capturedImageFormat: fileFormat = {
      uri: storedImageURI,
      name: getFileName(storedImageURI),
      type: getFileMIME(storedImageURI)
    };

    const formDataToUpload = new FormData();
    formDataToUpload.append('message', targetedExistingReport.remark);
    formDataToUpload.append('image', capturedImageFormat as any);
    formDataToUpload.append('alert_id', targetedExistingReport.alert_id as any);
    formDataToUpload.append('mobile', targetedExistingReport.mobile);
    formDataToUpload.append('category', targetedExistingReport.category);
    formDataToUpload.append('area_burnt', targetedExistingReport.area_burnt);
    formDataToUpload.append('timestamp', targetedExistingReport.timestamp);

    const urlToUpload: string = `${URLs.api_base_url}closed_fire.php`;
    const uploadResponse = await fetch(urlToUpload, {
      method: 'POST',
      body: formDataToUpload
    });

    const responseJSON = await uploadResponse.json();
    if (uploadResponse.status !== 200) {
      Toast.show({
        type: 'success',
        text1: 'Oops!',
        text2: responseJSON?.error
      })
      return false;
    }

    return targetedExistingReport;

  } catch (error) {
    console.log(error);
    return false;

  }
}

const deleteUploadedIncidentData = async ({ incident_id, imageUriToDelete }:
  { incident_id: number, imageUriToDelete: string }): Promise<boolean> => {
  try {

    await deleteRow({
      table_name: tbl_fire_incidents.tbl_name,
      column_name: 'id',
      column_value: incident_id
    });

    console.log('====================================');
    console.log(`Row deleted ${incident_id}`);
    console.log('====================================');

    await FileSystem.deleteAsync(imageUriToDelete);

    console.log('====================================');
    console.log(`Incident Deleted ${imageUriToDelete}`);
    console.log('====================================');
    return true;

  } catch (error) {
    console.log(error);
    return false;

  }
}

const deleteUploadedExisitingReportData = async ({ existingReportID, imageUriToDelete }:
  { existingReportID: number, imageUriToDelete: string }): Promise<boolean> => {
  try {

    await deleteRow({
      table_name: tbl_existing_fire_report.tbl_name,
      column_name: 'id',
      column_value: existingReportID
    });

    console.log('====================================');
    console.log(`Row deleted ${existingReportID}`);
    console.log('====================================');

    await FileSystem.deleteAsync(imageUriToDelete);

    console.log('====================================');
    console.log(`Exisiting Fire Report Deleted ${imageUriToDelete}`);
    console.log('====================================');
    return true;

  } catch (error) {
    console.log(error);
    return false;

  }
}

const processOfflineData = async (): Promise<void> => {
  try {

    const incidentsSqliteData: FireIncidentsType[] = await executeSQLiteOperation({ table_name: tbl_fire_incidents.tbl_name });
    const existingFireReports: ExistingFireReportType[] = await executeSQLiteOperation({ table_name: tbl_existing_fire_report.tbl_name });

    if (incidentsSqliteData.length > 0) {
      for (let incidentDataCounter = 0; incidentDataCounter < incidentsSqliteData.length; incidentDataCounter++) {
        console.log('Uploading Incident data', incidentDataCounter);

        const incidentId: number = incidentsSqliteData[incidentDataCounter].id;
        const uploadedIncidentData: FireIncidentsType | boolean = await prepareAndUploadIncidentData({ incident_id: incidentId });

        uploadedIncidentData ? await deleteUploadedIncidentData({
          incident_id: incidentId,
          // @ts-ignore
          imageUriToDelete: uploadedIncidentData.image as string
        }) :
          console.log('Unable to upload data. | Main Upload Outer Function :(');
      }
    }

    if (existingFireReports.length > 0) {
      for (let exisitingReportsCounter = 0; exisitingReportsCounter < existingFireReports.length; exisitingReportsCounter++) {
        console.log('Uploading Incident data', exisitingReportsCounter);

        const existingReportID: number = existingFireReports[exisitingReportsCounter].id;
        const uploadedExistingReport: ExistingFireReportType | boolean = await prepareAndUploadExisitingFire({ existingReportID });

        uploadedExistingReport ? await deleteUploadedExisitingReportData({
          existingReportID,
          // @ts-ignore
          imageUriToDelete: uploadedExistingReport.image as string
        }) :
          console.log('Unable to upload data. | Main Upload Outer Function :(');
      }
    }


  } catch (error) {
    console.log(`Error while uploading data`);
    console.log(error);
    isUploading = false;

  } finally {
    isUploading = true;
  }
}

const BACKGROUND_FETCH_TASK = 'background-fetch-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
  try {
    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      await processOfflineData();
    }
    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.log('Error in background task:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

const registerBackgroundFetchAsync = async (): Promise<void> => {
  try {
    await BackgroundFetch.registerTaskAsync(BACKGROUND_FETCH_TASK, {
      minimumInterval: 30, //15 minutes
      stopOnTerminate: false,
      startOnBoot: true,
    });
    console.log('Background fetch registered successfully');
  } catch (error) {
    console.log('Error registering background fetch', error);
  }
}

const unregisterBackgroundFetchAsync = async (): Promise<void> => {
  try {
    await BackgroundFetch.unregisterTaskAsync(BACKGROUND_FETCH_TASK);
    console.log('Background fetch unregistered successfully');
  } catch (error) {
    console.log('Error unregistering background fetch', error);
  }
}

const checkAndUploadData = async (): Promise<void> => {
  try {
    isUploading = true;

    const netInfo = await NetInfo.fetch();
    if (netInfo.isConnected) {
      const dbExists: boolean = await checkIfDbExists();
      if (dbExists)
        await processOfflineData();
      else
        console.log(`DB doesn't exists`);
    }
  } catch (error) {
    isUploading = false;
    console.log(error);
  }
};

export { registerBackgroundFetchAsync, unregisterBackgroundFetchAsync, checkAndUploadData };