interface CoordinatesType {
  lat: string | number,
  lng: string | number
}

interface UserCoordsType {
  latitude: number,
  longitude: number
}

interface AlertsResponseDataType {
  alert_id: number,
  lat: number | string,
  lng: number | string,
  status: string,
  handler: string,
  remarks: string,
  datetime: string,
  submitted_by: string
}

type AlertsDurationType = '24hrs' | '1week' | '15days';

export type {
  CoordinatesType, AlertsResponseDataType, UserCoordsType,
  AlertsDurationType
}