interface TBL_TYPE {
  tbl_name: string,
  tbl_struct: string[]
}

const STRUCT_fire_incidents: string[] =
  ['id', 'image', 'message', 'lat', 'lng', 'mobile', 'type', 'name', 'division_id'];

const STRUCT_existing_fire_report: string[] =
  ['id', 'remark', 'image', 'alert_id', 'mobile', 'category', 'area_burnt', 'timestamp'];

const tbl_fire_incidents: TBL_TYPE = {
  tbl_name: 'fire_incidents',
  tbl_struct: STRUCT_fire_incidents
}

const tbl_existing_fire_report: TBL_TYPE = {
  tbl_name: 'existing_fire_report',
  tbl_struct: STRUCT_existing_fire_report
}

const requiredDBTables = [
  tbl_existing_fire_report.tbl_name,
  tbl_fire_incidents.tbl_name
];

export {
  STRUCT_fire_incidents, STRUCT_existing_fire_report,
  tbl_fire_incidents, tbl_existing_fire_report,
  requiredDBTables
};