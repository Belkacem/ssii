import { Moment } from 'moment';

export interface IHoliday {
  id?: number;
  date?: Moment;
  name?: string;
  description?: string;
}

export const defaultValue: Readonly<IHoliday> = {};
