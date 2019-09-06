import { IRootState } from 'app/shared/reducers';
import { ACTION_TYPES } from './activity-report-timesheet.reducer';

import * as AbsenceType from 'app/entities/absence-type/absence-type.reducer';
import * as AbsenceExt from 'app/application/entities/absence/absence.actions';
import * as ActivityReport from 'app/entities/activity-report/activity-report.reducer';
import * as ActivityReportExt from 'app/application/entities/activity-report/activity-report.actions';
import * as Holiday from 'app/entities/holiday/holiday.reducer';
import * as HolidaysExt from 'app/application/entities/holiday/holiday.actions';
import * as Project from 'app/entities/project/project.reducer';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import * as ProjectResource from 'app/entities/project-resource/project-resource.reducer';
import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as ProjectResourceInfoExt from 'app/application/entities/project-resource-info/project-resource-info.actions';
import * as PersistedConfiguration from 'app/application/entities/persisted-configuration/persisted-configuration.actions';
import * as StandardActivityExt from 'app/application/entities/standard-activity/standard-activity.actions';
import * as ExceptionalActivity from 'app/entities/exceptional-activity/exceptional-activity.reducer';
import * as ExceptionalActivityExt from 'app/application/entities/exceptional-activity/exceptional-activity.actions';
import * as Invoice from 'app/application/entities/invoice/invoice.actions';
import * as Client from 'app/application/entities/client/client.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ResourceContract from 'app/application/entities/resource-contract/resource-contract.actions';
import * as ActivityReportFileExt from 'app/application/entities/activity-report-file/activity-report-file.actions';
import * as ResourceConfiguration from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { IActivityReport } from 'app/shared/model/activity-report.model';

import { isOwner } from 'app/application/common/utils/user-utils';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import moment, { Moment } from 'moment';
import { REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';

// Actions

// Get activtiy reoport by resourceId & Month
export const getActivityReportsByResourceIdAndMonth = (resourceId: number, month: Moment) => async (dispatch, getState) => {
  let state: IRootState = getState();
  const currentCompany = state.application.company.current;
  const account = state.authentication.account;
  const isCompanyOwner = isOwner(account, currentCompany);
  const startOfMonth = month
    .startOf('months')
    .clone()
    .format(FORMAT_DATE_SERVER);
  const endOfMonth = month
    .endOf('months')
    .clone()
    .format(FORMAT_DATE_SERVER);
  try {
    dispatch(resetActivityReportsTimeSheet());
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    dispatch(HolidaysExt.getHolidaysByDate(startOfMonth, endOfMonth));
    dispatch(AbsenceType.getEntities());
    dispatch(ResourceExt.getById(resourceId));
    dispatch(AbsenceExt.getDisabledByResource(resourceId));
    dispatch(ResourceContract.getByResource(resourceId));
    dispatch(PersistedConfiguration.getMyConfigurations());
    dispatch(ResourceConfiguration.getByResource(resourceId));
    await dispatch(ProjectResourceExt.getByResource(resourceId));
    state = getState();
    const projectResourceIds = state.projectResource.entities.map(projectResource => projectResource.id);
    const projectsIds = state.projectResource.entities
      .map(projectResource => projectResource.projectId)
      .filter(projectId => !!projectId)
      .filter((id, index, self) => self.indexOf(id) === index);
    dispatch(ProjectExt.getProjectsIdIn(projectsIds)).then(payload => {
      const clientIds = payload.value.data.map(project => project.clientId).filter((id, index, self) => self.indexOf(id) === index);
      if (clientIds.length > 0) {
        dispatch(Client.getClientsByIds(clientIds));
      }
      return payload;
    });
    if (isCompanyOwner) {
      dispatch(ProjectResourceInfoExt.getByProjectResources(projectResourceIds));
    }
    await dispatch(ActivityReportExt.getByProjectResourceAndMonth(projectResourceIds, month.format('YYYY-MM-01')));
    state = getState();
    const reportIds = state.activityReport.entities.map(report => report.id);
    if (reportIds.length > 0) {
      await Promise.all([
        dispatch(StandardActivityExt.getByActivityReports(reportIds)),
        dispatch(ExceptionalActivityExt.getByActivityReports(reportIds)),
        dispatch(Invoice.getByActivityReportsIn(reportIds)),
        dispatch(ActivityReportFileExt.getByActivityReportIdIn(reportIds))
      ]);
    }
  } catch (ex) {
    dispatch({ type: ACTION_TYPES.SET_HAS_ERROR, payload: true });
  }
  dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
};

// Get activtiy reoport by current resourceId & Month
export const getActivityReportsByMonth = (month: Moment) => async (dispatch, getState) => {
  let state: IRootState = getState();
  const currentResource = state.application.resource.current.entity;
  const startOfMonth = month
    .startOf('months')
    .clone()
    .format(FORMAT_DATE_SERVER);
  const endOfMonth = month
    .endOf('months')
    .clone()
    .format(FORMAT_DATE_SERVER);
  try {
    dispatch(resetActivityReportsTimeSheet());
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    dispatch(HolidaysExt.getHolidaysByDate(startOfMonth, endOfMonth));
    dispatch(AbsenceType.getEntities());
    dispatch(ResourceContract.getByResource(currentResource.id));
    dispatch(PersistedConfiguration.getMyConfigurations());
    dispatch(ResourceConfiguration.getByResource(currentResource.id));
    await dispatch(ActivityReportExt.getByCurrentResourceAndMonth(startOfMonth));
    state = getState();
    const projectResourcesIds = state.activityReport.entities
      .map(r => r.projectResourceId)
      .filter((id, index, self) => self.indexOf(id) === index);
    const reportIds = state.activityReport.entities.map(report => report.id);
    if (reportIds.length > 0) {
      dispatch(ActivityReportFileExt.getByActivityReportIdIn(reportIds));
    }
    if (projectResourcesIds.length > 0) {
      await dispatch(ProjectResourceExt.getProjectResourcesIdIn(projectResourcesIds));
      state = getState();
      const projectsIds = state.projectResource.entities.map(pr => pr.projectId).filter((id, index, self) => self.indexOf(id) === index);
      if (projectsIds.length > 0) {
        dispatch(ProjectExt.getProjectsIdIn(projectsIds));
      }
    }
    await Promise.all([
      dispatch(StandardActivityExt.getByResourceAndDateBetween(currentResource.id, startOfMonth, endOfMonth)),
      dispatch(ExceptionalActivityExt.getByResourceAndDateBetween(currentResource.id, startOfMonth, endOfMonth)),
      dispatch(AbsenceExt.getDisabledByCurrentResource())
    ]);
  } catch (ex) {
    dispatch({ type: ACTION_TYPES.SET_HAS_ERROR, payload: true });
  }
  dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
};

// Get activtiy reoport by id
export const getActivityReportsById = (activityReportId: number) => async (dispatch, getState) => {
  let state: IRootState = getState();
  try {
    dispatch(resetActivityReportsTimeSheet());
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
    await dispatch(ActivityReport.getEntity(activityReportId));
    state = getState();
    const activityReport = state.activityReport.entity;
    const month = moment(activityReport.month);
    const startOfMonth = month
      .startOf('months')
      .clone()
      .format(FORMAT_DATE_SERVER);
    const endOfMonth = month
      .endOf('months')
      .clone()
      .format(FORMAT_DATE_SERVER);
    dispatch(HolidaysExt.getHolidaysByDate(startOfMonth, endOfMonth));
    dispatch(AbsenceType.getEntities());
    dispatch(PersistedConfiguration.getMyConfigurations());
    await Promise.all([
      dispatch(ProjectResource.getEntity(activityReport.projectResourceId)),
      dispatch(StandardActivityExt.getByActivityReport(activityReport.id)),
      dispatch(ExceptionalActivityExt.getByActivityReport(activityReport.id)),
      dispatch(ActivityReportFileExt.getByActivityReportIdIn([activityReport.id]))
    ]);
    state = getState();
    const projectResource = state.projectResource.entity;
    await Promise.all([
      dispatch(ResourceContract.getByResource(projectResource.resourceId)),
      dispatch(Project.getEntity(projectResource.projectId)),
      dispatch(ResourceExt.getById(projectResource.resourceId)),
      dispatch(ResourceConfiguration.getByResource(projectResource.resourceId))
    ]);
  } catch (ex) {
    dispatch({ type: ACTION_TYPES.SET_HAS_ERROR, payload: true });
  }
  dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
};

export const setUpdatedActivityReport = (activityReport: IActivityReport) => (dispatch, getState) => {
  dispatch({ type: REQUEST(ActivityReport.ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST) });
  const state: IRootState = getState();
  const reports: IActivityReport[] = [...state.activityReport.entities].map(
    report => (report.id === activityReport.id ? activityReport : report)
  );
  return dispatch({
    type: SUCCESS(ActivityReport.ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST),
    payload: {
      data: reports,
      headers: { 'x-total-count': reports.length }
    }
  });
};

export const setStandardActivities = (standardActivities: IStandardActivity[], reset = false) => (dispatch, getState) => {
  const state: IRootState = getState();
  const new_acts = standardActivities.filter(act => !!act.id || act.morning || act.afternoon);
  const old_acts = state.application.standardActivity.entities;
  const changed = !reset && JSON.stringify(old_acts) !== JSON.stringify(new_acts);
  return dispatch({
    type: ACTION_TYPES.SET_STANDARD_ACTIVITY,
    payload: {
      activities: reset ? old_acts : standardActivities,
      changed
    }
  });
};

export const setExceptionalActivities = (exceptionalActivities: IExceptionalActivity[], reset = false) => (dispatch, getState) => {
  const state: IRootState = getState();
  const changed = !reset && JSON.stringify(state.application.exceptionalActivity.entities) !== JSON.stringify(exceptionalActivities);
  return dispatch({
    type: ACTION_TYPES.SET_EXCEPTIONAL_ACTIVITY,
    payload: {
      activities: reset ? state.application.exceptionalActivity.entities : exceptionalActivities,
      changed
    }
  });
};

export const resetActivityReportsTimeSheet = () => dispatch => {
  dispatch({ type: ACTION_TYPES.RESET });
  dispatch(ActivityReport.reset());
  dispatch(AbsenceExt.reset());
  // dispatch(Project.reset());
  dispatch(Holiday.reset());
  dispatch(StandardActivityExt.reset());
  dispatch(ExceptionalActivity.reset());
  dispatch(ProjectResource.reset());
  dispatch(ResourceExt.reset());
};
