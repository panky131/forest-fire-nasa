import { AlertsResponseDataType, UserCoordsType } from "@/utils/Types";
import { Dispatch, SetStateAction } from "react";
import { haversine } from "./CommonUtilsFuntions";


interface FilterMapAlertsFnPropType {
    alertsDataSet: AlertsResponseDataType[],
    rangeInKmToCheck: number,
    userCoordinates: UserCoordsType | undefined,
    setAlertsData: Dispatch<SetStateAction<AlertsResponseDataType[]>>
}

const FilterMapAlertsFunctions = ({
    alertsDataSet, setAlertsData, rangeInKmToCheck, userCoordinates
}: FilterMapAlertsFnPropType): void => {
    try {

        const filteredDataSet: AlertsResponseDataType[] = [];
        const dataSetLength: number = alertsDataSet.length;

        for (let currentDataIndex: number = dataSetLength - 1; currentDataIndex >= 0; currentDataIndex--) {

            const currentAlertData: AlertsResponseDataType = alertsDataSet[currentDataIndex];

            const latitude_1 = parseFloat(currentAlertData.lat as string);
            const longitude_1 = parseFloat(currentAlertData.lng as string);

            const latitude_2 = userCoordinates && userCoordinates.latitude ? userCoordinates.latitude : 0;
            const longitude_2 = userCoordinates && userCoordinates.longitude ? userCoordinates.longitude : 0;

            const distanceBetweenCoords = haversine(latitude_1, longitude_1, latitude_2, longitude_2);

            if (rangeInKmToCheck >= distanceBetweenCoords) {
                filteredDataSet.push(currentAlertData);
            }
        }

        setAlertsData(filteredDataSet);

    } catch (error) {
        console.log(error);
    }
}

export { FilterMapAlertsFunctions };