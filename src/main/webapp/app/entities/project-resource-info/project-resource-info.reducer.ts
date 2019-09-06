import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IProjectResourceInfo, defaultValue } from 'app/shared/model/project-resource-info.model';

export const ACTION_TYPES = {
  FETCH_PROJECTRESOURCEINFO_LIST: 'projectResourceInfo/FETCH_PROJECTRESOURCEINFO_LIST',
  FETCH_PROJECTRESOURCEINFO: 'projectResourceInfo/FETCH_PROJECTRESOURCEINFO',
  CREATE_PROJECTRESOURCEINFO: 'projectResourceInfo/CREATE_PROJECTRESOURCEINFO',
  UPDATE_PROJECTRESOURCEINFO: 'projectResourceInfo/UPDATE_PROJECTRESOURCEINFO',
  DELETE_PROJECTRESOURCEINFO: 'projectResourceInfo/DELETE_PROJECTRESOURCEINFO',
  RESET: 'projectResourceInfo/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IProjectResourceInfo>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ProjectResourceInfoState = Readonly<typeof initialState>;

// Reducer

export default (state: ProjectResourceInfoState = initialState, action): ProjectResourceInfoState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECTRESOURCEINFO):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_PROJECTRESOURCEINFO):
    case REQUEST(ACTION_TYPES.UPDATE_PROJECTRESOURCEINFO):
    case REQUEST(ACTION_TYPES.DELETE_PROJECTRESOURCEINFO):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECTRESOURCEINFO):
    case FAILURE(ACTION_TYPES.CREATE_PROJECTRESOURCEINFO):
    case FAILURE(ACTION_TYPES.UPDATE_PROJECTRESOURCEINFO):
    case FAILURE(ACTION_TYPES.DELETE_PROJECTRESOURCEINFO):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTRESOURCEINFO):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PROJECTRESOURCEINFO):
    case SUCCESS(ACTION_TYPES.UPDATE_PROJECTRESOURCEINFO):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PROJECTRESOURCEINFO):
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

const apiUrl = 'api/project-resource-infos';

// Actions

export const getEntities: ICrudGetAllAction<IProjectResourceInfo> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST,
    payload: axios.get<IProjectResourceInfo>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IProjectResourceInfo> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCEINFO,
    payload: axios.get<IProjectResourceInfo>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IProjectResourceInfo> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PROJECTRESOURCEINFO,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IProjectResourceInfo> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTRESOURCEINFO,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IProjectResourceInfo> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PROJECTRESOURCEINFO,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
