import axios from 'axios';
import { ACTION_TYPES } from './activity-report-list.reducer';
import { IActivityReport } from 'app/shared/model/activity-report.model';
import { IProject } from 'app/shared/model/project.model';
import { IProjectResource } from 'app/shared/model/project-resource.model';
import { IResource } from 'app/shared/model/resource.model';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import moment from 'moment';
import { IRootState } from 'app/shared/reducers';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

// Actions
// Owner
export const getByMonth = month => async (dispatch, getState) => {
  const companyId = getState().application.company.current.id;
  let requestUrl = `api/activity-reports?override&companyId=${companyId}&month=${month}&page=0&size=999`;
  dispatch({
    type: ACTION_TYPES.SET_LOADING,
    payload: true
  });
  await dispatch({
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST,
    payload: axios.get<IActivityReport>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  const reports = getState().application.activityReportList.reports;
  if (reports && reports.length > 0) {
    const activityReportIds = reports.map(r => r.id);
    const projectResourceIds = reports.map(r => r.projectResourceId).filter((id, index, self) => self.indexOf(id) === index);
    if (activityReportIds.length > 0) {
      requestUrl = `api/standard-activities?override&activityReportIdIn=${activityReportIds.join(
        ','
      )}&page=0&size=999&cacheBuster=${new Date().getTime()}`;
      dispatch({
        type: ACTION_TYPES.FETCH_STANDARD_ACTIVITIES_LIST,
        payload: axios.get<IStandardActivity>(requestUrl)
      });
      requestUrl = `api/exceptional-activities?override&activityReportIdIn=${activityReportIds.join(
        ','
      )}&page=0&size=999&cacheBuster=${new Date().getTime()}`;
      dispatch({
        type: ACTION_TYPES.FETCH_EXCEPTIONAL_ACTIVITIES_LIST,
        payload: axios.get<IExceptionalActivity>(requestUrl)
      });
    }
    if (projectResourceIds.length > 0) {
      requestUrl = `api/project-resources?override&idIn=${projectResourceIds.join(
        ','
      )}&page=0&size=999&cacheBuster=${new Date().getTime()}`;
      await dispatch({
        type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
        payload: axios.get<IProjectResource>(requestUrl)
      });
      const projectResources = getState().application.activityReportList.projectResources;
      if (projectResources && projectResources.length > 0) {
        const projectIds = projectResources.map(pr => pr.projectId).filter((id, index, self) => self.indexOf(id) === index);
        if (projectIds.length > 0) {
          requestUrl = `api/projects?override&companyId=${companyId}&page=0&size=999&idIn=${projectIds.join(
            ','
          )}&cacheBuster=${new Date().getTime()}`;
          dispatch({
            type: ACTION_TYPES.FETCH_PROJECTS_LIST,
            payload: axios.get<IProject>(requestUrl)
          });
        }
        const resourceIds = projectResources.map(pr => pr.resourceId).filter((id, index, self) => self.indexOf(id) === index);
        if (resourceIds.length > 0) {
          requestUrl = `api/resources?override&companyId=${companyId}&page=0&size=999&idIn=${resourceIds.join(
            ','
          )}&cacheBuster=${new Date().getTime()}`;
          dispatch({
            type: ACTION_TYPES.FETCH_RESOURCE_LIST,
            payload: axios.get<IResource>(requestUrl)
          });
        }
      }
    }
  }
  dispatch({
    type: ACTION_TYPES.SET_LOADING,
    payload: false
  });
};

export const getByCurrentResource = () => async (dispatch, getState) => {
  const state: IRootState = getState();
  const resourceId = state.application.resource.current.entity.id;
  let requestUrl = `api/activity-reports?override&resourceId=${resourceId}&page=0&size=999&sort=month,desc`;
  dispatch({
    type: ACTION_TYPES.SET_LOADING,
    payload: true
  });
  // ACTIVITY REPORTS
  await dispatch({
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST,
    payload: axios.get<IActivityReport>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  const reports = getState().application.activityReportList.reports;
  if (reports && reports.length > 0) {
    // STANDARD ACTIVITIES
    const startDate = reports
      .map(report => report.month)
      .reduce((maxDate, month) => (maxDate.isAfter(month) ? moment(month) : maxDate), moment())
      .startOf('months')
      .format(FORMAT_DATE_SERVER);
    const endDate = reports
      .map(report => report.month)
      .reduce((maxDate, month) => (maxDate.isBefore(month) ? moment(month) : maxDate), moment())
      .endOf('months')
      .format(FORMAT_DATE_SERVER);
    requestUrl = `api/standard-activities?override&resourceId=${resourceId}&startDate=${startDate}&endDate=${endDate}&page=0&size=9999&cacheBuster=${new Date().getTime()}`;
    dispatch({
      type: ACTION_TYPES.FETCH_STANDARD_ACTIVITIES_LIST,
      payload: axios.get<IStandardActivity>(requestUrl)
    });
    requestUrl = `api/exceptional-activities?override&resourceId=${resourceId}&startDate=${startDate}&endDate=${endDate}&page=0&size=9999&cacheBuster=${new Date().getTime()}`;
    dispatch({
      type: ACTION_TYPES.FETCH_EXCEPTIONAL_ACTIVITIES_LIST,
      payload: axios.get<IExceptionalActivity>(requestUrl)
    });
    // PROJECT RESOURCES
    const projectResourceIds = reports.map(r => r.projectResourceId).filter((id, index, self) => self.indexOf(id) === index);
    if (projectResourceIds.length > 0) {
      requestUrl = `api/project-resources?override&idIn=${projectResourceIds.join(
        ','
      )}&page=0&size=999&cacheBuster=${new Date().getTime()}`;
      await dispatch({
        type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
        payload: axios.get<IProjectResource>(requestUrl)
      });
      // PROJECTS
      const projectResources = getState().application.activityReportList.projectResources;
      if (projectResources && projectResources.length > 0) {
        const projectIds = projectResources.map(pr => pr.projectId).filter((id, index, self) => self.indexOf(id) === index);
        if (projectIds.length > 0) {
          requestUrl = `api/projects?override&idIn=${projectIds.join(',')}&page=0&size=999&cacheBuster=${new Date().getTime()}`;
          dispatch({
            type: ACTION_TYPES.FETCH_PROJECTS_LIST,
            payload: axios.get<IProject>(requestUrl)
          });
        }
      }
    }
  }
  dispatch({
    type: ACTION_TYPES.SET_LOADING,
    payload: false
  });
};
