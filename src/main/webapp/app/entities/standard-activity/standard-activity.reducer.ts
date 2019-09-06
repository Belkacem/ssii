import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IStandardActivity, defaultValue } from 'app/shared/model/standard-activity.model';

export const ACTION_TYPES = {
  FETCH_STANDARDACTIVITY_LIST: 'standardActivity/FETCH_STANDARDACTIVITY_LIST',
  FETCH_STANDARDACTIVITY: 'standardActivity/FETCH_STANDARDACTIVITY',
  CREATE_STANDARDACTIVITY: 'standardActivity/CREATE_STANDARDACTIVITY',
  UPDATE_STANDARDACTIVITY: 'standardActivity/UPDATE_STANDARDACTIVITY',
  DELETE_STANDARDACTIVITY: 'standardActivity/DELETE_STANDARDACTIVITY',
  RESET: 'standardActivity/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IStandardActivity>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type StandardActivityState = Readonly<typeof initialState>;

// Reducer

export default (state: StandardActivityState = initialState, action): StandardActivityState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST):
    case REQUEST(ACTION_TYPES.FETCH_STANDARDACTIVITY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_STANDARDACTIVITY):
    case REQUEST(ACTION_TYPES.UPDATE_STANDARDACTIVITY):
    case REQUEST(ACTION_TYPES.DELETE_STANDARDACTIVITY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST):
    case FAILURE(ACTION_TYPES.FETCH_STANDARDACTIVITY):
    case FAILURE(ACTION_TYPES.CREATE_STANDARDACTIVITY):
    case FAILURE(ACTION_TYPES.UPDATE_STANDARDACTIVITY):
    case FAILURE(ACTION_TYPES.DELETE_STANDARDACTIVITY):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_STANDARDACTIVITY):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_STANDARDACTIVITY):
    case SUCCESS(ACTION_TYPES.UPDATE_STANDARDACTIVITY):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_STANDARDACTIVITY):
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

const apiUrl = 'api/standard-activities';

// Actions

export const getEntities: ICrudGetAllAction<IStandardActivity> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST,
    payload: axios.get<IStandardActivity>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IStandardActivity> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_STANDARDACTIVITY,
    payload: axios.get<IStandardActivity>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IStandardActivity> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_STANDARDACTIVITY,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IStandardActivity> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_STANDARDACTIVITY,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IStandardActivity> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_STANDARDACTIVITY,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
