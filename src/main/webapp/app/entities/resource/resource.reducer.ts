import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IResource, defaultValue } from 'app/shared/model/resource.model';

export const ACTION_TYPES = {
  FETCH_RESOURCE_LIST: 'resource/FETCH_RESOURCE_LIST',
  FETCH_RESOURCE: 'resource/FETCH_RESOURCE',
  CREATE_RESOURCE: 'resource/CREATE_RESOURCE',
  UPDATE_RESOURCE: 'resource/UPDATE_RESOURCE',
  DELETE_RESOURCE: 'resource/DELETE_RESOURCE',
  RESET: 'resource/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IResource>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ResourceState = Readonly<typeof initialState>;

// Reducer

export default (state: ResourceState = initialState, action): ResourceState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_RESOURCE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_RESOURCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_RESOURCE):
    case REQUEST(ACTION_TYPES.UPDATE_RESOURCE):
    case REQUEST(ACTION_TYPES.DELETE_RESOURCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_RESOURCE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_RESOURCE):
    case FAILURE(ACTION_TYPES.CREATE_RESOURCE):
    case FAILURE(ACTION_TYPES.UPDATE_RESOURCE):
    case FAILURE(ACTION_TYPES.DELETE_RESOURCE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_RESOURCE):
    case SUCCESS(ACTION_TYPES.UPDATE_RESOURCE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_RESOURCE):
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

const apiUrl = 'api/resources';

// Actions

export const getEntities: ICrudGetAllAction<IResource> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_RESOURCE_LIST,
    payload: axios.get<IResource>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IResource> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_RESOURCE,
    payload: axios.get<IResource>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IResource> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_RESOURCE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IResource> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IResource> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_RESOURCE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
