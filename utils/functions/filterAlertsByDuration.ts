import { AlertsDurationType, AlertsResponseDataType } from "../Types";

const getTimeDifference = (datetime: string, now: Date): number => {
  return now.getTime() - new Date(datetime).getTime();
};

const getTimeLimit = (duration: AlertsDurationType): number => {
  const durationMap: Record<AlertsDurationType, number> = {
    '24hrs': 24 * 60 * 60 * 1000, // 24 hours in milliseconds
    '1week': 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
    '15days': 15 * 24 * 60 * 60 * 1000 // 15 days in milliseconds
  };

  const timeLimit = durationMap[duration];

  if (!timeLimit) {
    throw new Error('Invalid duration specified');
  }

  return timeLimit;
};

const filterByDuration = (data: AlertsResponseDataType[], duration: AlertsDurationType): AlertsResponseDataType[] => {
  const now = new Date();
  const timeLimit = getTimeLimit(duration);

  return data.filter(({ datetime }) => getTimeDifference(datetime, now) <= timeLimit);
};

export { filterByDuration };