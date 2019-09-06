import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IAbsenceBalanceAdjustment, defaultValue } from 'app/shared/model/absence-balance-adjustment.model';

export const ACTION_TYPES = {
  FETCH_ABSENCEBALANCEADJUSTMENT_LIST: 'absenceBalanceAdjustment/FETCH_ABSENCEBALANCEADJUSTMENT_LIST',
  FETCH_ABSENCEBALANCEADJUSTMENT: 'absenceBalanceAdjustment/FETCH_ABSENCEBALANCEADJUSTMENT',
  CREATE_ABSENCEBALANCEADJUSTMENT: 'absenceBalanceAdjustment/CREATE_ABSENCEBALANCEADJUSTMENT',
  UPDATE_ABSENCEBALANCEADJUSTMENT: 'absenceBalanceAdjustment/UPDATE_ABSENCEBALANCEADJUSTMENT',
  DELETE_ABSENCEBALANCEADJUSTMENT: 'absenceBalanceAdjustment/DELETE_ABSENCEBALANCEADJUSTMENT',
  RESET: 'absenceBalanceAdjustment/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IAbsenceBalanceAdjustment>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type AbsenceBalanceAdjustmentState = Readonly<typeof initialState>;

// Reducer

export default (state: AbsenceBalanceAdjustmentState = initialState, action): AbsenceBalanceAdjustmentState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ABSENCEBALANCEADJUSTMENT):
    case REQUEST(ACTION_TYPES.UPDATE_ABSENCEBALANCEADJUSTMENT):
    case REQUEST(ACTION_TYPES.DELETE_ABSENCEBALANCEADJUSTMENT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT):
    case FAILURE(ACTION_TYPES.CREATE_ABSENCEBALANCEADJUSTMENT):
    case FAILURE(ACTION_TYPES.UPDATE_ABSENCEBALANCEADJUSTMENT):
    case FAILURE(ACTION_TYPES.DELETE_ABSENCEBALANCEADJUSTMENT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ABSENCEBALANCEADJUSTMENT):
    case SUCCESS(ACTION_TYPES.UPDATE_ABSENCEBALANCEADJUSTMENT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ABSENCEBALANCEADJUSTMENT):
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

const apiUrl = 'api/absence-balance-adjustments';

// Actions

export const getEntities: ICrudGetAllAction<IAbsenceBalanceAdjustment> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT_LIST,
    payload: axios.get<IAbsenceBalanceAdjustment>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IAbsenceBalanceAdjustment> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT,
    payload: axios.get<IAbsenceBalanceAdjustment>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IAbsenceBalanceAdjustment> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ABSENCEBALANCEADJUSTMENT,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IAbsenceBalanceAdjustment> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCEBALANCEADJUSTMENT,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IAbsenceBalanceAdjustment> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ABSENCEBALANCEADJUSTMENT,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
