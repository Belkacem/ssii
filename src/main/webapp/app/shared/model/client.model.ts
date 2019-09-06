import { IClientContact } from 'app/shared/model/client-contact.model';

export const enum Form {
  SARL = 'SARL',
  EURL = 'EURL',
  SAS = 'SAS',
  SASU = 'SASU',
  OTHER = 'OTHER'
}

export interface IClient {
  id?: number;
  name?: string;
  siren?: string;
  email?: string;
  tva?: string;
  paymentDelay?: number;
  form?: Form;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  iban?: string;
  bic?: string;
  reference?: string;
  attachActivityReports?: boolean;
  separateInvoices?: boolean;
  companyId?: number;
  contacts?: IClientContact[];
}

export const defaultValue: Readonly<IClient> = {
  attachActivityReports: false,
  separateInvoices: false
};
