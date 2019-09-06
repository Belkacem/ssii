import { Moment } from 'moment';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

export interface IActivityReport {
  id?: number;
  month?: Moment;
  submitted?: boolean;
  submissionDate?: Moment;
  editable?: boolean;
  comment?: string;
  projectResourceId?: number;
  standardActivities?: IStandardActivity[];
  exceptionalActivities?: IExceptionalActivity[];
}

export const defaultValue: Readonly<IActivityReport> = {
  submitted: false,
  editable: false
};
