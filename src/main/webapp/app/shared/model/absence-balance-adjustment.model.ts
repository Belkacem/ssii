import { Moment } from 'moment';

export interface IAbsenceBalanceAdjustment {
  id?: number;
  date?: Moment;
  balance?: number;
  manualAdjustment?: boolean;
  comment?: string;
  absenceBalanceId?: number;
  absenceId?: number;
}

export const defaultValue: Readonly<IAbsenceBalanceAdjustment> = {
  manualAdjustment: false
};
