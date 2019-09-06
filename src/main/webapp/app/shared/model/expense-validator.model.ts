import { Moment } from 'moment';

export interface IExpenseValidator {
  id?: number;
  fullname?: string;
  email?: string;
  emailNotificationDate?: Moment;
  active?: boolean;
  ticket?: string;
  userId?: number;
  companyId?: number;
}

export const defaultValue: Readonly<IExpenseValidator> = {
  active: false
};
