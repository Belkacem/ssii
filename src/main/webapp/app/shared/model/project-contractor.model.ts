import { Moment } from 'moment';

export interface IProjectContractor {
  id?: number;
  fullname?: string;
  email?: string;
  emailNotificationDate?: Moment;
  active?: boolean;
  ticket?: string;
  projectId?: number;
  userId?: number;
}

export const defaultValue: Readonly<IProjectContractor> = {
  active: false
};
