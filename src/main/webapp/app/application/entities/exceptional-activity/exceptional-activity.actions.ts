import axios from 'axios';
import { ACTION_TYPES } from './exceptional-activity.reducer';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';
import { setExceptionalActivities } from 'app/application/entities/activity-report/activity-report-timesheet.actions';

const apiUrl = 'api/exceptional-activities';

// Actions
export const getByActivityReportsAndDateBetween = (activityReportIds: number[], startDate, endDate, loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const requestUrl = `${apiUrl}?override&page=0&size=999&startDate=${startDate}&endDate=${endDate}&activityReportIdIn=${activityReportIds.join(
    ','
  )}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST,
    payload: axios.get<IExceptionalActivity>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
};

export const getByActivityReport = (activityReportId: number, loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const requestUrl = `${apiUrl}?override&size=999&page=0&activityReportIdIn=${activityReportId}`;
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST,
    payload: axios.get<IExceptionalActivity>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  dispatch(setExceptionalActivities(result.value.data));
  return result;
};

export const getByActivityReports = (activityReportIds: number[], loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const requestUrl = `${apiUrl}?override&page=0&size=999&activityReportIdIn=${activityReportIds.join(',')}`;
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST,
    payload: axios.get<IExceptionalActivity>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  dispatch(setExceptionalActivities(result.value.data));
  return result;
};

export const getByResourceAndDateBetween = (resourceId: number, startDate: string, endDate: string, loading = true) => async dispatch => {
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: true });
  }
  const result = await dispatch({
    type: ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST,
    payload: axios.get<IExceptionalActivity>(
      `${apiUrl}?override&page=0&size=999&resourceId=${resourceId}&startDate=${startDate}&endDate=${endDate}&cacheBuster=${new Date().getTime()}`
    )
  });
  if (loading) {
    dispatch({ type: ACTION_TYPES.SET_LOADING, payload: false });
  }
  dispatch(setExceptionalActivities(result.value.data));
  return result;
};

export const createBulk = (activities: IExceptionalActivity[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_EXCEPTIONALACTIVITIES,
    payload: axios.post(`${apiUrl}/bulk`, activities)
  });

export const updateBulk = (activities: IExceptionalActivity[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITIES,
    payload: axios.put(`${apiUrl}/bulk`, activities)
  });

export const deleteBulk = (ids: number[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.DELETE_EXCEPTIONALACTIVITIES,
    payload: axios.delete(`${apiUrl}?ids=${ids.join(',')}`)
  });

export const update = (
  updated: IExceptionalActivity[],
  created: IExceptionalActivity[],
  deleted: IExceptionalActivity[],
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
      await dispatch(createBulk(created));
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
