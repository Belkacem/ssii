import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IActivityReportFile, defaultValue } from 'app/shared/model/activity-report-file.model';

export const ACTION_TYPES = {
  FETCH_ACTIVITYREPORTFILE_LIST: 'activityReportFile/FETCH_ACTIVITYREPORTFILE_LIST',
  FETCH_ACTIVITYREPORTFILE: 'activityReportFile/FETCH_ACTIVITYREPORTFILE',
  CREATE_ACTIVITYREPORTFILE: 'activityReportFile/CREATE_ACTIVITYREPORTFILE',
  UPDATE_ACTIVITYREPORTFILE: 'activityReportFile/UPDATE_ACTIVITYREPORTFILE',
  DELETE_ACTIVITYREPORTFILE: 'activityReportFile/DELETE_ACTIVITYREPORTFILE',
  SET_BLOB: 'activityReportFile/SET_BLOB',
  RESET: 'activityReportFile/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IActivityReportFile>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ActivityReportFileState = Readonly<typeof initialState>;

// Reducer

export default (state: ActivityReportFileState = initialState, action): ActivityReportFileState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ACTIVITYREPORTFILE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ACTIVITYREPORTFILE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ACTIVITYREPORTFILE):
    case REQUEST(ACTION_TYPES.UPDATE_ACTIVITYREPORTFILE):
    case REQUEST(ACTION_TYPES.DELETE_ACTIVITYREPORTFILE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ACTIVITYREPORTFILE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ACTIVITYREPORTFILE):
    case FAILURE(ACTION_TYPES.CREATE_ACTIVITYREPORTFILE):
    case FAILURE(ACTION_TYPES.UPDATE_ACTIVITYREPORTFILE):
    case FAILURE(ACTION_TYPES.DELETE_ACTIVITYREPORTFILE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ACTIVITYREPORTFILE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ACTIVITYREPORTFILE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ACTIVITYREPORTFILE):
    case SUCCESS(ACTION_TYPES.UPDATE_ACTIVITYREPORTFILE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ACTIVITYREPORTFILE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    case ACTION_TYPES.SET_BLOB:
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType
        }
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const apiUrl = 'api/activity-report-files';

// Actions

export const getEntities: ICrudGetAllAction<IActivityReportFile> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ACTIVITYREPORTFILE_LIST,
    payload: axios.get<IActivityReportFile>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IActivityReportFile> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ACTIVITYREPORTFILE,
    payload: axios.get<IActivityReportFile>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IActivityReportFile> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ACTIVITYREPORTFILE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IActivityReportFile> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ACTIVITYREPORTFILE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IActivityReportFile> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ACTIVITYREPORTFILE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType
  }
});

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
