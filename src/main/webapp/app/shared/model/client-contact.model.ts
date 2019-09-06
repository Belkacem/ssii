import { Moment } from 'moment';

export interface IClientContact {
  id?: number;
  fullname?: string;
  email?: string;
  phoneNumber?: string;
  emailNotificationDate?: Moment;
  active?: boolean;
  clientId?: number;
}

export const defaultValue: Readonly<IClientContact> = {
  active: false
};
