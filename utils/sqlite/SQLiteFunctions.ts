import { useDatabase } from "./SQLiteDBLocals";
import { SQLiteExecuteAsyncResult } from "expo-sqlite";

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

interface newRowParamsType {
  query: string,
  values: any[]
}

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

export {
  FireIncidentsType, deleteRow,
  insertRow, executeSQLiteOperation
}