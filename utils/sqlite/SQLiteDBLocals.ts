import * as FileSystem from 'expo-file-system';
import * as SQLite from 'expo-sqlite';

const LocalDBName: string = "ForestFireUttarakhand.db";
const ExpectedDBStructure: string | undefined = process.env.EXPO_PUBLIC_SQLITE_STRUCT + `?q=${new Date().getTime()}`;

const checkIfDbExists = async (): Promise<boolean> => {
    try {
        const dbPath: string = `${FileSystem.documentDirectory}SQLite/${LocalDBName}`;
        const fileInfo = await FileSystem.getInfoAsync(dbPath);
        console.log(`DB Exists : ${fileInfo.exists}`);
        return fileInfo.exists;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const downloadDBStructure = async (): Promise<boolean> => {
    try {

        const directoryPath = FileSystem.documentDirectory + 'SQLite/';

        const directoryInfo = await FileSystem.getInfoAsync(directoryPath);
        if (!directoryInfo.exists) {
            console.log("Creating directory:", directoryPath);
            await FileSystem.makeDirectoryAsync(directoryPath, { intermediates: true });
        }

        const filePath = FileSystem.documentDirectory + 'SQLite/' + LocalDBName;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        if (fileInfo.exists) {
            console.log("Deleting existing file:", filePath);
            await FileSystem.deleteAsync(filePath);
        }

        console.log("Downloading DB structure from:", ExpectedDBStructure);
        if (ExpectedDBStructure) {
            await FileSystem.downloadAsync(
                ExpectedDBStructure,
                filePath
            );
            console.log("Download successful.");
        }
        return true;
    } catch (error) {
        console.error("Error downloading DB structure:", error);
        return false;
    }
};

const initializeDatabase = async (): Promise<boolean> => {
    console.log("DB Init Start")
    try {
        if (!await downloadDBStructure()) return false;
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

const useDatabase = async (): Promise<any | boolean> => {
    try {

        const db = await SQLite.openDatabaseAsync(LocalDBName, {
            useNewConnection: true
        });

        return db;
    } catch (error) {
        console.error('Error opening database:', error);
        return false;
    }
};
export { initializeDatabase, useDatabase, checkIfDbExists };