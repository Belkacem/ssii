import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IActivityReport, defaultValue } from 'app/shared/model/activity-report.model';

export const ACTION_TYPES = {
  FETCH_ACTIVITYREPORT_LIST: 'activityReport/FETCH_ACTIVITYREPORT_LIST',
  FETCH_ACTIVITYREPORT: 'activityReport/FETCH_ACTIVITYREPORT',
  CREATE_ACTIVITYREPORT: 'activityReport/CREATE_ACTIVITYREPORT',
  UPDATE_ACTIVITYREPORT: 'activityReport/UPDATE_ACTIVITYREPORT',
  DELETE_ACTIVITYREPORT: 'activityReport/DELETE_ACTIVITYREPORT',
  RESET: 'activityReport/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IActivityReport>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ActivityReportState = Readonly<typeof initialState>;

// Reducer

export default (state: ActivityReportState = initialState, action): ActivityReportState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ACTIVITYREPORT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ACTIVITYREPORT):
    case REQUEST(ACTION_TYPES.UPDATE_ACTIVITYREPORT):
    case REQUEST(ACTION_TYPES.DELETE_ACTIVITYREPORT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ACTIVITYREPORT):
    case FAILURE(ACTION_TYPES.CREATE_ACTIVITYREPORT):
    case FAILURE(ACTION_TYPES.UPDATE_ACTIVITYREPORT):
    case FAILURE(ACTION_TYPES.DELETE_ACTIVITYREPORT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ACTIVITYREPORT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ACTIVITYREPORT):
    case SUCCESS(ACTION_TYPES.UPDATE_ACTIVITYREPORT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ACTIVITYREPORT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const apiUrl = 'api/activity-reports';

// Actions

export const getEntities: ICrudGetAllAction<IActivityReport> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT_LIST,
    payload: axios.get<IActivityReport>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IActivityReport> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ACTIVITYREPORT,
    payload: axios.get<IActivityReport>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IActivityReport> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ACTIVITYREPORT,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IActivityReport> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ACTIVITYREPORT,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IActivityReport> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ACTIVITYREPORT,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
