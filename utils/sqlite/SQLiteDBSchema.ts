interface TBL_TYPE {
  tbl_name: string,
  tbl_struct: string[]
}

const STRUCT_fire_incidents: string[] = ['id', 'image', 'message', 'lat', 'lng', 'mobile', 'type', 'name', 'division_id'];

const tbl_fire_incidents: TBL_TYPE = {
  tbl_name: "fire_incidents",
  tbl_struct: STRUCT_fire_incidents
}

export {
  STRUCT_fire_incidents,
  tbl_fire_incidents
};