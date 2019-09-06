import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IExceptionalActivity, defaultValue } from 'app/shared/model/exceptional-activity.model';

export const ACTION_TYPES = {
  FETCH_EXCEPTIONALACTIVITY_LIST: 'exceptionalActivity/FETCH_EXCEPTIONALACTIVITY_LIST',
  FETCH_EXCEPTIONALACTIVITY: 'exceptionalActivity/FETCH_EXCEPTIONALACTIVITY',
  CREATE_EXCEPTIONALACTIVITY: 'exceptionalActivity/CREATE_EXCEPTIONALACTIVITY',
  UPDATE_EXCEPTIONALACTIVITY: 'exceptionalActivity/UPDATE_EXCEPTIONALACTIVITY',
  DELETE_EXCEPTIONALACTIVITY: 'exceptionalActivity/DELETE_EXCEPTIONALACTIVITY',
  RESET: 'exceptionalActivity/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IExceptionalActivity>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ExceptionalActivityState = Readonly<typeof initialState>;

// Reducer

export default (state: ExceptionalActivityState = initialState, action): ExceptionalActivityState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY_LIST):
    case REQUEST(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_EXCEPTIONALACTIVITY):
    case REQUEST(ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITY):
    case REQUEST(ACTION_TYPES.DELETE_EXCEPTIONALACTIVITY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY_LIST):
    case FAILURE(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY):
    case FAILURE(ACTION_TYPES.CREATE_EXCEPTIONALACTIVITY):
    case FAILURE(ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITY):
    case FAILURE(ACTION_TYPES.DELETE_EXCEPTIONALACTIVITY):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_EXCEPTIONALACTIVITY):
    case SUCCESS(ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITY):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_EXCEPTIONALACTIVITY):
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

const apiUrl = 'api/exceptional-activities';

// Actions

export const getEntities: ICrudGetAllAction<IExceptionalActivity> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY_LIST,
    payload: axios.get<IExceptionalActivity>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IExceptionalActivity> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_EXCEPTIONALACTIVITY,
    payload: axios.get<IExceptionalActivity>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IExceptionalActivity> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_EXCEPTIONALACTIVITY,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IExceptionalActivity> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITY,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IExceptionalActivity> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_EXCEPTIONALACTIVITY,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
