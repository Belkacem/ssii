import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IResourceConfiguration, defaultValue } from 'app/shared/model/resource-configuration.model';

export const ACTION_TYPES = {
  FETCH_RESOURCECONFIGURATION_LIST: 'resourceConfiguration/FETCH_RESOURCECONFIGURATION_LIST',
  FETCH_RESOURCECONFIGURATION: 'resourceConfiguration/FETCH_RESOURCECONFIGURATION',
  CREATE_RESOURCECONFIGURATION: 'resourceConfiguration/CREATE_RESOURCECONFIGURATION',
  UPDATE_RESOURCECONFIGURATION: 'resourceConfiguration/UPDATE_RESOURCECONFIGURATION',
  DELETE_RESOURCECONFIGURATION: 'resourceConfiguration/DELETE_RESOURCECONFIGURATION',
  RESET: 'resourceConfiguration/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IResourceConfiguration>,
  entity: defaultValue,
  updating: false,
  updateSuccess: false
};

export type ResourceConfigurationState = Readonly<typeof initialState>;

// Reducer

export default (state: ResourceConfigurationState = initialState, action): ResourceConfigurationState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_RESOURCECONFIGURATION_LIST):
    case REQUEST(ACTION_TYPES.FETCH_RESOURCECONFIGURATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_RESOURCECONFIGURATION):
    case REQUEST(ACTION_TYPES.UPDATE_RESOURCECONFIGURATION):
    case REQUEST(ACTION_TYPES.DELETE_RESOURCECONFIGURATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_RESOURCECONFIGURATION_LIST):
    case FAILURE(ACTION_TYPES.FETCH_RESOURCECONFIGURATION):
    case FAILURE(ACTION_TYPES.CREATE_RESOURCECONFIGURATION):
    case FAILURE(ACTION_TYPES.UPDATE_RESOURCECONFIGURATION):
    case FAILURE(ACTION_TYPES.DELETE_RESOURCECONFIGURATION):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCECONFIGURATION_LIST):
      return {
        ...state,
        loading: false,
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCECONFIGURATION):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_RESOURCECONFIGURATION):
    case SUCCESS(ACTION_TYPES.UPDATE_RESOURCECONFIGURATION):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_RESOURCECONFIGURATION):
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

const apiUrl = 'api/resource-configurations';

// Actions

export const getEntities: ICrudGetAllAction<IResourceConfiguration> = (page, size, sort) => ({
  type: ACTION_TYPES.FETCH_RESOURCECONFIGURATION_LIST,
  payload: axios.get<IResourceConfiguration>(`${apiUrl}?cacheBuster=${new Date().getTime()}`)
});

export const getEntity: ICrudGetAction<IResourceConfiguration> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_RESOURCECONFIGURATION,
    payload: axios.get<IResourceConfiguration>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IResourceConfiguration> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_RESOURCECONFIGURATION,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IResourceConfiguration> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCECONFIGURATION,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IResourceConfiguration> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_RESOURCECONFIGURATION,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
