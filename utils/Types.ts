interface CoordinatesType {
  lat: string | number,
  lng: string | number;
}

interface UserCoordsType {
  latitude: number,
  longitude: number;
}

interface AlertsResponseDataType {
  alert_id: number,
  lat: number | string,
  lng: number | string,
  status: string,
  handler: string,
  remarks: string,
  datetime: string,
  /** Satellite / capture time from API (`alertCaptured`). */
  alertCaptured?: string | null,
  /** Legacy column name; used if `alertCaptured` is absent. */
  acq_date?: string | null,
  submitted_by: string,
  beat: string,
  range_name: string,
  division: string,
  /** Forest category from API (`tbl_forest_type` / beat lookup). */
  ft_type?: string | null;
}

type AlertsDurationType = '24hrs' | '3days' | 'all';

export type {
  CoordinatesType, AlertsResponseDataType, UserCoordsType,
  AlertsDurationType
};