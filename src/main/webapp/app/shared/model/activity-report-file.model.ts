export interface IActivityReportFile {
  id?: number;
  fileContentType?: string;
  file?: any;
  activityReportId?: number;
}

export const defaultValue: Readonly<IActivityReportFile> = {};
