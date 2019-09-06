import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IAbsenceBalance, defaultValue } from 'app/shared/model/absence-balance.model';

export const ACTION_TYPES = {
  FETCH_ABSENCEBALANCE_LIST: 'absenceBalance/FETCH_ABSENCEBALANCE_LIST',
  FETCH_ABSENCEBALANCE: 'absenceBalance/FETCH_ABSENCEBALANCE',
  CREATE_ABSENCEBALANCE: 'absenceBalance/CREATE_ABSENCEBALANCE',
  UPDATE_ABSENCEBALANCE: 'absenceBalance/UPDATE_ABSENCEBALANCE',
  DELETE_ABSENCEBALANCE: 'absenceBalance/DELETE_ABSENCEBALANCE',
  RESET: 'absenceBalance/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IAbsenceBalance>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type AbsenceBalanceState = Readonly<typeof initialState>;

// Reducer

export default (state: AbsenceBalanceState = initialState, action): AbsenceBalanceState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEBALANCE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEBALANCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ABSENCEBALANCE):
    case REQUEST(ACTION_TYPES.UPDATE_ABSENCEBALANCE):
    case REQUEST(ACTION_TYPES.DELETE_ABSENCEBALANCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEBALANCE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEBALANCE):
    case FAILURE(ACTION_TYPES.CREATE_ABSENCEBALANCE):
    case FAILURE(ACTION_TYPES.UPDATE_ABSENCEBALANCE):
    case FAILURE(ACTION_TYPES.DELETE_ABSENCEBALANCE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEBALANCE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEBALANCE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ABSENCEBALANCE):
    case SUCCESS(ACTION_TYPES.UPDATE_ABSENCEBALANCE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ABSENCEBALANCE):
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

const apiUrl = 'api/absence-balances';

// Actions

export const getEntities: ICrudGetAllAction<IAbsenceBalance> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEBALANCE_LIST,
    payload: axios.get<IAbsenceBalance>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IAbsenceBalance> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEBALANCE,
    payload: axios.get<IAbsenceBalance>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IAbsenceBalance> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ABSENCEBALANCE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IAbsenceBalance> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCEBALANCE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IAbsenceBalance> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ABSENCEBALANCE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
