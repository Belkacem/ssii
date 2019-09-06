import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IExpenseType, defaultValue } from 'app/shared/model/expense-type.model';

export const ACTION_TYPES = {
  FETCH_EXPENSETYPE_LIST: 'expenseType/FETCH_EXPENSETYPE_LIST',
  FETCH_EXPENSETYPE: 'expenseType/FETCH_EXPENSETYPE',
  CREATE_EXPENSETYPE: 'expenseType/CREATE_EXPENSETYPE',
  UPDATE_EXPENSETYPE: 'expenseType/UPDATE_EXPENSETYPE',
  DELETE_EXPENSETYPE: 'expenseType/DELETE_EXPENSETYPE',
  RESET: 'expenseType/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IExpenseType>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ExpenseTypeState = Readonly<typeof initialState>;

// Reducer

export default (state: ExpenseTypeState = initialState, action): ExpenseTypeState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXPENSETYPE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_EXPENSETYPE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_EXPENSETYPE):
    case REQUEST(ACTION_TYPES.UPDATE_EXPENSETYPE):
    case REQUEST(ACTION_TYPES.DELETE_EXPENSETYPE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_EXPENSETYPE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_EXPENSETYPE):
    case FAILURE(ACTION_TYPES.CREATE_EXPENSETYPE):
    case FAILURE(ACTION_TYPES.UPDATE_EXPENSETYPE):
    case FAILURE(ACTION_TYPES.DELETE_EXPENSETYPE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSETYPE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSETYPE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_EXPENSETYPE):
    case SUCCESS(ACTION_TYPES.UPDATE_EXPENSETYPE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_EXPENSETYPE):
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

const apiUrl = 'api/expense-types';

// Actions

export const getEntities: ICrudGetAllAction<IExpenseType> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSETYPE_LIST,
    payload: axios.get<IExpenseType>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IExpenseType> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSETYPE,
    payload: axios.get<IExpenseType>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IExpenseType> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_EXPENSETYPE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IExpenseType> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSETYPE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IExpenseType> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_EXPENSETYPE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
