import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IPersistedConfiguration, defaultValue } from 'app/shared/model/persisted-configuration.model';

export const ACTION_TYPES = {
  FETCH_PERSISTEDCONFIGURATION_LIST: 'persistedConfiguration/FETCH_PERSISTEDCONFIGURATION_LIST',
  FETCH_PERSISTEDCONFIGURATION: 'persistedConfiguration/FETCH_PERSISTEDCONFIGURATION',
  CREATE_PERSISTEDCONFIGURATION: 'persistedConfiguration/CREATE_PERSISTEDCONFIGURATION',
  UPDATE_PERSISTEDCONFIGURATION: 'persistedConfiguration/UPDATE_PERSISTEDCONFIGURATION',
  DELETE_PERSISTEDCONFIGURATION: 'persistedConfiguration/DELETE_PERSISTEDCONFIGURATION',
  RESET: 'persistedConfiguration/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IPersistedConfiguration>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type PersistedConfigurationState = Readonly<typeof initialState>;

// Reducer

export default (state: PersistedConfigurationState = initialState, action): PersistedConfigurationState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_PERSISTEDCONFIGURATION):
    case REQUEST(ACTION_TYPES.UPDATE_PERSISTEDCONFIGURATION):
    case REQUEST(ACTION_TYPES.DELETE_PERSISTEDCONFIGURATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION):
    case FAILURE(ACTION_TYPES.CREATE_PERSISTEDCONFIGURATION):
    case FAILURE(ACTION_TYPES.UPDATE_PERSISTEDCONFIGURATION):
    case FAILURE(ACTION_TYPES.DELETE_PERSISTEDCONFIGURATION):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PERSISTEDCONFIGURATION):
    case SUCCESS(ACTION_TYPES.UPDATE_PERSISTEDCONFIGURATION):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PERSISTEDCONFIGURATION):
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

const apiUrl = 'api/persisted-configurations';

// Actions

export const getEntities: ICrudGetAllAction<IPersistedConfiguration> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION_LIST,
    payload: axios.get<IPersistedConfiguration>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IPersistedConfiguration> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION,
    payload: axios.get<IPersistedConfiguration>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IPersistedConfiguration> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PERSISTEDCONFIGURATION,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IPersistedConfiguration> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PERSISTEDCONFIGURATION,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IPersistedConfiguration> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PERSISTEDCONFIGURATION,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
