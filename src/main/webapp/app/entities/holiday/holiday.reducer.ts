import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IHoliday, defaultValue } from 'app/shared/model/holiday.model';

export const ACTION_TYPES = {
  FETCH_HOLIDAY_LIST: 'holiday/FETCH_HOLIDAY_LIST',
  FETCH_HOLIDAY: 'holiday/FETCH_HOLIDAY',
  CREATE_HOLIDAY: 'holiday/CREATE_HOLIDAY',
  UPDATE_HOLIDAY: 'holiday/UPDATE_HOLIDAY',
  DELETE_HOLIDAY: 'holiday/DELETE_HOLIDAY',
  RESET: 'holiday/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IHoliday>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type HolidayState = Readonly<typeof initialState>;

// Reducer

export default (state: HolidayState = initialState, action): HolidayState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_HOLIDAY_LIST):
    case REQUEST(ACTION_TYPES.FETCH_HOLIDAY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_HOLIDAY):
    case REQUEST(ACTION_TYPES.UPDATE_HOLIDAY):
    case REQUEST(ACTION_TYPES.DELETE_HOLIDAY):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_HOLIDAY_LIST):
    case FAILURE(ACTION_TYPES.FETCH_HOLIDAY):
    case FAILURE(ACTION_TYPES.CREATE_HOLIDAY):
    case FAILURE(ACTION_TYPES.UPDATE_HOLIDAY):
    case FAILURE(ACTION_TYPES.DELETE_HOLIDAY):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_HOLIDAY_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_HOLIDAY):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_HOLIDAY):
    case SUCCESS(ACTION_TYPES.UPDATE_HOLIDAY):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_HOLIDAY):
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

const apiUrl = 'api/holidays';

// Actions

export const getEntities: ICrudGetAllAction<IHoliday> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_HOLIDAY_LIST,
    payload: axios.get<IHoliday>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IHoliday> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_HOLIDAY,
    payload: axios.get<IHoliday>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IHoliday> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_HOLIDAY,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IHoliday> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_HOLIDAY,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IHoliday> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_HOLIDAY,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
