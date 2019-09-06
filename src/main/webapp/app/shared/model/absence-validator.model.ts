import { Moment } from 'moment';
import { IResource } from 'app/shared/model/resource.model';

export interface IAbsenceValidator {
  id?: number;
  fullname?: string;
  email?: string;
  emailNotificationDate?: Moment;
  active?: boolean;
  ticket?: string;
  userId?: number;
  companyId?: number;
  resources?: IResource[];
}

export const defaultValue: Readonly<IAbsenceValidator> = {
  active: false
};
