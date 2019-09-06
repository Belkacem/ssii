export const enum Form {
  SARL = 'SARL',
  EURL = 'EURL',
  SAS = 'SAS',
  SASU = 'SASU',
  OTHER = 'OTHER'
}

export interface ICompany {
  id?: number;
  name?: string;
  siren?: string;
  email?: string;
  domainName?: string;
  logoContentType?: string;
  logo?: any;
  tva?: string;
  form?: Form;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  iban?: string;
  bic?: string;
  capital?: string;
  ownerId?: number;
}

export const defaultValue: Readonly<ICompany> = {};
