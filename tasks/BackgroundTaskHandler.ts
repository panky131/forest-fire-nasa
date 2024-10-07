import * as TaskManager from 'expo-task-manager';
import * as BackgroundFetch from 'expo-background-fetch';
import NetInfo from '@react-native-community/netinfo';
import { checkIfDbExists } from '@/utils/sqlite/SQLiteDBLocals';

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

const uploadOfflineData = async (): Promise<void> => { }


const BACKGROUND_FETCH_TASK = 'background-fetch-task';

TaskManager.defineTask(BACKGROUND_FETCH_TASK, async () => {
    try {
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
            await uploadOfflineData();
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
        const netInfo = await NetInfo.fetch();
        if (netInfo.isConnected) {
            const dbExists: boolean = await checkIfDbExists();
            if (dbExists)
                await uploadOfflineData();
            else
                console.log(`DB doesn't exists`);
        }
    } catch (error) {
        console.log(error);
    }
};

export { registerBackgroundFetchAsync, unregisterBackgroundFetchAsync, checkAndUploadData };