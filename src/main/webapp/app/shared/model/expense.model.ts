import { Moment } from 'moment';

export const enum ValidationStatus {
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface IExpense {
  id?: number;
  date?: Moment;
  submissionDate?: Moment;
  description?: string;
  amount?: number;
  vat?: number;
  validationStatus?: ValidationStatus;
  resourceId?: number;
  projectResourceId?: number;
  typeId?: number;
  creatorId?: number;
  validatorId?: number;
}

export const defaultValue: Readonly<IExpense> = {};
