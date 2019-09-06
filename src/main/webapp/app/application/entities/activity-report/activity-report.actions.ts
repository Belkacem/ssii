import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { ACTION_TYPES } from 'app/entities/activity-report/activity-report.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './activity-report.reducer';
import { IRootState } from 'app/shared/reducers';
import moment from 'moment';

const apiUrl = 'api/activity-reports';

// Actions
export const getByProjectResourceAndMonth = (projectResourceIds: number[], month) => {
  const requestUrl = `${apiUrl}?override&projectResourceIdIn=${projectResourceIds.join(',')}&month=${month}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST,
    payload: axios.get<IActivityReport>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByProjectResource = (projectResourceIds: number[]) => {
  const requestUrl = `${apiUrl}?override&projectResourceIdIn=${projectResourceIds.join(',')}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST,
    payload: axios.get<IActivityReport>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByCurrentResourceAndMonth = month => async (dispatch, getState) => {
  const state: IRootState = getState();
  const resourceId = state.application.resource.current.entity.id;
  const requestUrl = `${apiUrl}?override&resourceId=${resourceId}&month=${month}&page=0&size=999`;

  await dispatch({
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST,
    payload: axios.get<IActivityReport>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const create = entity => ({
  type: ACTION_TYPES.UPDATE_ACTIVITYREPORT,
  payload: axios.post(`${apiUrl}?override`, cleanEntity(entity))
});

export const update = entity => ({
  type: ACTION_TYPES.UPDATE_ACTIVITYREPORT,
  payload: axios.put(`${apiUrl}?override`, cleanEntity(entity))
});

export const sendReminder = (ids: number[]) => ({
  type: ACTION_TYPES_EXT.SEND_REMINDER_ACTIVITYREPORT,
  payload: axios.get(`${apiUrl}/send-reminder?activityReportIds=${ids.join(',')}`)
});

export const sendValidationEmail = (activityReportId: number) => ({
  type: ACTION_TYPES.UPDATE_ACTIVITYREPORT,
  payload: axios.get(`${apiUrl}/send-validation-status?activityReportId=${activityReportId}`)
});

export const download = (activityReport: IActivityReport, resourceName: string, projectName: string) => async (dispatch, getState) => {
  await dispatch({
    type: ACTION_TYPES_EXT.DOWNLOAD_ACTIVITYREPORT,
    payload: axios.get(`${apiUrl}/${activityReport.id}/download`)
  });
  const state: IRootState = getState();
  const link = document.createElement('a');
  link.download =
    `${resourceName.replace(' ', '_')}-${projectName.replace(' ', '_')}-${moment(activityReport.month).format('MMM_YYYY')}` + '.pdf';
  link.href = 'data:application/pdf;charset=utf-8;base64,' + state.application.activityReport.pdf;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
