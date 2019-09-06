import { Moment } from 'moment';

export const enum ValidationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface IStandardActivity {
  id?: number;
  date?: Moment;
  morning?: boolean;
  afternoon?: boolean;
  validationDate?: Moment;
  validationStatus?: ValidationStatus;
  activityReportId?: number;
  validatorId?: number;
}

export const defaultValue: Readonly<IStandardActivity> = {
  morning: false,
  afternoon: false
};
