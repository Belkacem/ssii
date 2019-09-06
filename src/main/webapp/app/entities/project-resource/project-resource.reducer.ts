import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IProjectResource, defaultValue } from 'app/shared/model/project-resource.model';

export const ACTION_TYPES = {
  FETCH_PROJECTRESOURCE_LIST: 'projectResource/FETCH_PROJECTRESOURCE_LIST',
  FETCH_PROJECTRESOURCE: 'projectResource/FETCH_PROJECTRESOURCE',
  CREATE_PROJECTRESOURCE: 'projectResource/CREATE_PROJECTRESOURCE',
  UPDATE_PROJECTRESOURCE: 'projectResource/UPDATE_PROJECTRESOURCE',
  DELETE_PROJECTRESOURCE: 'projectResource/DELETE_PROJECTRESOURCE',
  RESET: 'projectResource/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IProjectResource>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ProjectResourceState = Readonly<typeof initialState>;

// Reducer

export default (state: ProjectResourceState = initialState, action): ProjectResourceState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECTRESOURCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_PROJECTRESOURCE):
    case REQUEST(ACTION_TYPES.UPDATE_PROJECTRESOURCE):
    case REQUEST(ACTION_TYPES.DELETE_PROJECTRESOURCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECTRESOURCE):
    case FAILURE(ACTION_TYPES.CREATE_PROJECTRESOURCE):
    case FAILURE(ACTION_TYPES.UPDATE_PROJECTRESOURCE):
    case FAILURE(ACTION_TYPES.DELETE_PROJECTRESOURCE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTRESOURCE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PROJECTRESOURCE):
    case SUCCESS(ACTION_TYPES.UPDATE_PROJECTRESOURCE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PROJECTRESOURCE):
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

const apiUrl = 'api/project-resources';

// Actions

export const getEntities: ICrudGetAllAction<IProjectResource> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
    payload: axios.get<IProjectResource>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IProjectResource> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCE,
    payload: axios.get<IProjectResource>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IProjectResource> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PROJECTRESOURCE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IProjectResource> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTRESOURCE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IProjectResource> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PROJECTRESOURCE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
