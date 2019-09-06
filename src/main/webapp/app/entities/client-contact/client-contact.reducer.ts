import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IClientContact, defaultValue } from 'app/shared/model/client-contact.model';

export const ACTION_TYPES = {
  FETCH_CLIENTCONTACT_LIST: 'clientContact/FETCH_CLIENTCONTACT_LIST',
  FETCH_CLIENTCONTACT: 'clientContact/FETCH_CLIENTCONTACT',
  CREATE_CLIENTCONTACT: 'clientContact/CREATE_CLIENTCONTACT',
  UPDATE_CLIENTCONTACT: 'clientContact/UPDATE_CLIENTCONTACT',
  DELETE_CLIENTCONTACT: 'clientContact/DELETE_CLIENTCONTACT',
  RESET: 'clientContact/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IClientContact>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ClientContactState = Readonly<typeof initialState>;

// Reducer

export default (state: ClientContactState = initialState, action): ClientContactState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_CLIENTCONTACT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_CLIENTCONTACT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_CLIENTCONTACT):
    case REQUEST(ACTION_TYPES.UPDATE_CLIENTCONTACT):
    case REQUEST(ACTION_TYPES.DELETE_CLIENTCONTACT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_CLIENTCONTACT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CLIENTCONTACT):
    case FAILURE(ACTION_TYPES.CREATE_CLIENTCONTACT):
    case FAILURE(ACTION_TYPES.UPDATE_CLIENTCONTACT):
    case FAILURE(ACTION_TYPES.DELETE_CLIENTCONTACT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_CLIENTCONTACT_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_CLIENTCONTACT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_CLIENTCONTACT):
    case SUCCESS(ACTION_TYPES.UPDATE_CLIENTCONTACT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_CLIENTCONTACT):
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

const apiUrl = 'api/client-contacts';

// Actions

export const getEntities: ICrudGetAllAction<IClientContact> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_CLIENTCONTACT_LIST,
    payload: axios.get<IClientContact>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IClientContact> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_CLIENTCONTACT,
    payload: axios.get<IClientContact>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IClientContact> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_CLIENTCONTACT,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IClientContact> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_CLIENTCONTACT,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IClientContact> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_CLIENTCONTACT,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
