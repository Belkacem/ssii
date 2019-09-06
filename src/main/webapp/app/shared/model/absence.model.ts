import { Moment } from 'moment';

export const enum ValidationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface IAbsence {
  id?: number;
  submissionDate?: Moment;
  start?: Moment;
  startHalfDay?: boolean;
  end?: Moment;
  endHalfDay?: boolean;
  description?: string;
  numberDays?: number;
  validationDate?: Moment;
  validationStatus?: ValidationStatus;
  validationComment?: string;
  resourceId?: number;
  typeId?: number;
  creatorId?: number;
  validatorId?: number;
}

export const defaultValue: Readonly<IAbsence> = {
  startHalfDay: false,
  endHalfDay: false
};
