import { Moment } from 'moment';

export interface IAbsenceBalance {
  id?: number;
  date?: Moment;
  balance?: number;
  taken?: number;
  typeId?: number;
  resourceId?: number;
}

export const defaultValue: Readonly<IAbsenceBalance> = {};
