export const enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER'
}

export interface IAbsenceType {
  id?: number;
  type?: string;
  code?: number;
  hasBalance?: boolean;
  gender?: Gender;
}

export const defaultValue: Readonly<IAbsenceType> = {
  hasBalance: false
};
