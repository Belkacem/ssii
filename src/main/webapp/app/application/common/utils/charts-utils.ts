import { Moment } from 'moment';

export type GranularityType = 'months' | 'weeks' | 'days';
export type UnitsType = 'years' | 'months' | 'weeks';

export const getGranularity = (unit: UnitsType): GranularityType => {
  switch (unit) {
    case 'years':
      return 'months';
    case 'months':
      return 'days';
    case 'weeks':
    default:
      return 'days';
  }
};

export const getDateFormat = (unit: UnitsType): string => {
  switch (unit) {
    case 'years':
      return 'MMMM';
    case 'months':
      return 'DD MMM';
    case 'weeks':
    default:
      return 'ddd DD MMM';
  }
};

export const getChartDates = (date: Moment, unit: UnitsType): Moment[] => {
  const granularity = getGranularity(unit);
  const dates = [];
  const startDate = date.clone().startOf(unit);
  const endDate = date.clone().endOf(unit);
  while (startDate.isBefore(endDate)) {
    dates.push(startDate.clone());
    startDate.add(1, granularity);
  }
  return dates;
};
