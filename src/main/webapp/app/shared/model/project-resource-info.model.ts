import { Moment } from 'moment';

export interface IProjectResourceInfo {
  id?: number;
  startDate?: Moment;
  dailyRate?: number;
  paymentDelay?: number;
  reference?: string;
  projectResourceId?: number;
}

export const defaultValue: Readonly<IProjectResourceInfo> = {};
