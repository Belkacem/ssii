import { Moment } from 'moment';

export const enum ContractType {
  EMPLOYEE = 'EMPLOYEE',
  FREELANCE = 'FREELANCE',
  INTERN = 'INTERN',
  OTHER = 'OTHER'
}

export interface IResourceContract {
  id?: number;
  type?: ContractType;
  startDate?: Moment;
  endDate?: Moment;
  compensation?: number;
  resourceId?: number;
}

export const defaultValue: Readonly<IResourceContract> = {};
