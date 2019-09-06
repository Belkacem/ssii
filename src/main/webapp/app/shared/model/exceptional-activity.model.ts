import { Moment } from 'moment';

export const enum ValidationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export const enum ExceptionalActivityType {
  ASTREINTE_ACTIVE = 'ASTREINTE_ACTIVE',
  ASTREINTE_ACTIVE_SITE = 'ASTREINTE_ACTIVE_SITE',
  ASTREINTE_PASSIVE = 'ASTREINTE_PASSIVE'
}

export interface IExceptionalActivity {
  id?: number;
  date?: Moment;
  start?: number;
  nbHours?: number;
  validationDate?: Moment;
  validationStatus?: ValidationStatus;
  type?: ExceptionalActivityType;
  activityReportId?: number;
  validatorId?: number;
}

export const defaultValue: Readonly<IExceptionalActivity> = {};
