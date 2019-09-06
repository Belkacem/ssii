import { Moment } from 'moment';

export interface IProjectValidator {
  id?: number;
  fullname?: string;
  email?: string;
  emailNotificationDate?: Moment;
  active?: boolean;
  ticket?: string;
  projectId?: number;
  userId?: number;
}

export const defaultValue: Readonly<IProjectValidator> = {
  active: false
};
