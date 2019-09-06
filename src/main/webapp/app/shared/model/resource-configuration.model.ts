export interface IResourceConfiguration {
  id?: number;
  active?: boolean;
  canReportExpenses?: boolean;
  hasRTT?: boolean;
  daysCP?: number;
  daysRTT?: number;
  resourceId?: number;
}

export const defaultValue: Readonly<IResourceConfiguration> = {
  active: false,
  canReportExpenses: false,
  hasRTT: false
};
