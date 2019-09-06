export interface IProject {
  id?: number;
  nom?: string;
  localisation?: string;
  companyId?: number;
  clientId?: number;
}

export const defaultValue: Readonly<IProject> = {};
