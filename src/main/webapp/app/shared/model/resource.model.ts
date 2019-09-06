import { Moment } from 'moment';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';

export const enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface IResource {
  id?: number;
  identification?: string;
  email?: string;
  secondaryEmail?: string;
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  dateOfBirth?: Moment;
  socialSecurity?: string;
  phoneNumber?: string;
  hireDate?: Moment;
  countryOfBirth?: string;
  townOfBirth?: string;
  citizenShip?: string;
  workPermitType?: string;
  workPermitNumber?: string;
  workPermitExpiryDate?: Moment;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  ticket?: string;
  draft?: boolean;
  companyId?: number;
  userId?: number;
  validators?: IAbsenceValidator[];
}

export const defaultValue: Readonly<IResource> = {
  draft: false
};
