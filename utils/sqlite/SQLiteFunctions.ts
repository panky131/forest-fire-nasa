import * as SQLite from 'expo-sqlite';
import { SQLiteExecuteAsyncResult } from "expo-sqlite";

import { requiredDBTables } from "./SQLiteDBSchema";

const LocalDBName: string = "ForestFireUttarakhand.db";

interface FireIncidentsType {
  id: number,
  image: string,
  message: string,
  lat: string,
  lng: string,
  mobile: string,
  type: string,
  name: string,
  division_id: string
}

interface ExistingFireReportType {
  id: number,
  alert_id: number,
  area_burnt: string,
  category: string,
  image: string,
  mobile: string,
  remark: string,
  timestamp: string
}

interface newRowParamsType {
  query: string,
  values: any[]
}

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

const executeSQLiteOperation = async ({ table_name, query = "" }:
  { table_name?: string, query?: string }):
  Promise<SQLiteExecuteAsyncResult<FireIncidentsType> | any> => {

  try {
    const db = await useDatabase();
    const data = await db.getAllAsync(query ? query : `SELECT * FROM ${table_name}`);

    return data;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const deleteRow = async ({ table_name, column_name, column_value }:
  { table_name: string, column_name: string, column_value: number }):
  Promise<boolean | null> => {

  try {

    const db = await useDatabase();

    const deleteInspectionQuery = `DELETE FROM ${table_name} WHERE ${column_name} = '${column_value}'`;
    await db.runAsync(deleteInspectionQuery);

    console.log(`Row deleted | ${column_value}`)

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const insertRow = async ({ query, values }:
  newRowParamsType): Promise<boolean | null> => {
  try {

    const db = await useDatabase();
    await db.runAsync(query, values);

    return true;
  } catch (error) {
    console.log(error);
    return false;
  }
}

const isDBModified = async (): Promise<boolean> => {
  try {
    console.log('Checking if DB has changes');

    const query = `SELECT name FROM sqlite_master WHERE type='table' AND name IN (${requiredDBTables.map(name => `'${name}'`).join(',')});`;
    const foundTables = await executeSQLiteOperation({ query });

    const foundTableNames = foundTables.map((row: { name: string }) => row.name);
    const missingTables = requiredDBTables.filter(table => !foundTableNames.includes(table));

    if (missingTables.length === 0) {
      console.log('All required tables are present');
      return false;
    }

    console.log('Missing tables:', missingTables);
    return true;

  } catch (error) {
    console.error('Error while checking DB:', error);
    return true;
  }
};


export {
  FireIncidentsType, deleteRow, ExistingFireReportType,
  insertRow, executeSQLiteOperation,
  isDBModified
}