import { Moment } from 'moment';

export interface IProjectResource {
  id?: number;
  active?: boolean;
  projectEmail?: string;
  canReportExpenses?: boolean;
  startDate?: Moment;
  endDate?: Moment;
  projectId?: number;
  resourceId?: number;
}

export const defaultValue: Readonly<IProjectResource> = {
  active: false,
  canReportExpenses: false
};
