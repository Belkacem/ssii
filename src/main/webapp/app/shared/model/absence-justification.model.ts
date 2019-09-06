export interface IAbsenceJustification {
  id?: number;
  fileContentType?: string;
  file?: any;
  absenceId?: number;
}

export const defaultValue: Readonly<IAbsenceJustification> = {};
