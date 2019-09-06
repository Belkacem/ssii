import moment, { Moment } from 'moment';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { getHtmlPage } from 'app/application/common/utils/template-utils';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { IActivityReportFile } from 'app/shared/model/activity-report-file.model';

/**
 * Convert Number to Moment Hours
 * @param {number} n
 * @return Moment
 */
export function nbrToHours(n: number): Moment {
  return moment('00', 'hh').minutes(n * 60);
}

/**
 * Convert Moment Hours to Number
 * @param {Moment} hours
 * @return {number} n
 */
export function hoursToNbr(hours: Moment): number {
  return hours.hours() + hours.minutes() / 60;
}

export const getActivityReportHtml = (activityReportFile: IActivityReportFile) => getHtmlPage(activityReportFile.file);

export const enum ActivityReportValidationStatus {
  OVERDUE = 'OVERDUE',
  EDITABLE = 'EDITABLE',
  SUBMITED = 'SUBMITED',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PENDING = 'PENDING'
}

export interface IActivityReportValidationStatus {
  validationStatus: ActivityReportValidationStatus;
  submissionDate?: Moment;
  validationDate?: Moment;
  validatorId?: number;
}

export const getValidationStatusList = (
  reports: IActivityReport[],
  standards: IStandardActivity[],
  exceptionals: IExceptionalActivity[]
): IActivityReportValidationStatus[] => {
  if (reports.length === 0) return [];
  const editableReport = reports.find(r => r.editable);
  const submittedReport = reports.find(r => r.submitted);
  const result: IActivityReportValidationStatus[] = [];
  if (submittedReport) {
    if (editableReport) {
      result.push({ validationStatus: ActivityReportValidationStatus.EDITABLE });
      result.push({ submissionDate: submittedReport.submissionDate, validationStatus: ActivityReportValidationStatus.SUBMITED });
      return result;
    } else {
      result.push({ submissionDate: submittedReport.submissionDate, validationStatus: ActivityReportValidationStatus.SUBMITED });
    }
  }
  if (editableReport) {
    result.push({ validationStatus: ActivityReportValidationStatus.EDITABLE });
    const overdueReport = reports.find(r => r.editable && moment(r.month).isBefore(moment(), 'months'));
    if (overdueReport) {
      result.push({ validationStatus: ActivityReportValidationStatus.OVERDUE });
    }
    return result;
  }
  const filteredStandards = standards.filter(act => act.morning || act.afternoon);
  const hasPending =
    filteredStandards.find(act => act.validationStatus === 'PENDING') || exceptionals.find(act => act.validationStatus === 'PENDING');
  const hasRejected =
    standards.find(act => act.validationStatus === 'REJECTED') || exceptionals.find(act => act.validationStatus === 'REJECTED');
  const first = (standards.length > 0 && standards[0]) || (exceptionals.length > 0 && exceptionals[0]);
  if (hasPending) {
    result.push({ validationStatus: ActivityReportValidationStatus.PENDING });
  } else if (hasRejected) {
    result.push({
      validationStatus: ActivityReportValidationStatus.REJECTED,
      validationDate: hasRejected.validationDate,
      validatorId: hasRejected.validatorId
    });
  } else {
    result.push({
      validationStatus: ActivityReportValidationStatus.APPROVED,
      validationDate: first.validationDate,
      validatorId: first.validatorId
    });
  }
  return result;
};

export const getValidationStatus = (
  reports: IActivityReport[],
  standards: IStandardActivity[],
  exceptionals: IExceptionalActivity[]
): IActivityReportValidationStatus => {
  const statusList = getValidationStatusList(reports, standards, exceptionals);
  return statusList.length > 0 ? statusList[statusList.length - 1] : { validationStatus: ActivityReportValidationStatus.PENDING };
};
