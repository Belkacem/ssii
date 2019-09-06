import axios from 'axios';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';
import { ACTION_TYPES } from './standard-activity.reducer';
import { FORMAT_DATE_SERVER } from 'app/application/common/config/constants';
import { setStandardActivities } from 'app/application/entities/activity-report/activity-report-timesheet.actions';
import moment from 'moment';

const apiUrl = 'api/standard-activities';

// Actions

export const getByActivityReportsAndDateBetween = (activityReportIds: number[], startDate, endDate, loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const requestUrl = `${apiUrl}?override&page=0&size=999&startDate=${startDate}&endDate=${endDate}&activityReportIdIn=${activityReportIds.join(
    ','
  )}`;
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST,
    payload: axios.get<IStandardActivity>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  return result;
};

export const getByActivityReports = (activityReportIds: number[], loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const requestUrl = `${apiUrl}?override&page=0&size=999&activityReportIdIn=${activityReportIds.join(',')}`;
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST,
    payload: axios.get<IStandardActivity>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  dispatch(setStandardActivities(result.value.data));
  return result;
};

export const getByActivityReport = (activityReportId: number, loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const requestUrl = `${apiUrl}?override&size=999&page=0&activityReportIdIn=${activityReportId}`;
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST,
    payload: axios.get<IStandardActivity>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  dispatch(setStandardActivities(result.value.data));
  return result;
};

export const getByResourceAndDateBetween = (resourceId: number, startDate: string, endDate: string, loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST,
    payload: axios.get<IStandardActivity>(
      `${apiUrl}?override&page=0&size=999&resourceId=${resourceId}&startDate=${startDate}&endDate=${endDate}&cacheBuster=${new Date().getTime()}`
    )
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  dispatch(setStandardActivities(result.value.data));
  return result;
};

export const updateBulk = (activities: IStandardActivity[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_STANDARDACTIVITIES,
    payload: axios.put(`${apiUrl}/bulk`, activities)
  });

export const createBulk = (activities: IStandardActivity[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_STANDARDACTIVITIES,
    payload: axios.post(`${apiUrl}/bulk`, activities)
  });

export const deleteBulk = (ids: number[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.DELETE_STANDARDACTIVITIES,
    payload: axios.delete(`${apiUrl}/bulk?ids=${ids.join(',')}`)
  });

export const update = (
  updated: IStandardActivity[],
  created: IStandardActivity[],
  deleted: IStandardActivity[],
  callBack: Function
) => async dispatch => {
  dispatch({ type: ACTION_TYPES.SET_UPDATING, payload: true });
  if (deleted.length !== 0 || updated.length !== 0 || created.length !== 0) {
    if (deleted.length > 0) {
      await dispatch(deleteBulk(deleted.map(act => act.id)));
    }
    if (updated.length > 0) {
      await dispatch(updateBulk(updated));
    }
    if (created.length > 0) {
      const payload: any = created.map(act => ({
        ...act,
        date: moment(act.date).format(FORMAT_DATE_SERVER)
      }));
      await dispatch(createBulk(payload));
    }
  }
  if (!!callBack) {
    await callBack();
  }
  dispatch({ type: ACTION_TYPES.SET_UPDATING, payload: false });
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
