import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IExpense, defaultValue } from 'app/shared/model/expense.model';

export const ACTION_TYPES = {
  FETCH_EXPENSE_LIST: 'expense/FETCH_EXPENSE_LIST',
  FETCH_EXPENSE: 'expense/FETCH_EXPENSE',
  CREATE_EXPENSE: 'expense/CREATE_EXPENSE',
  UPDATE_EXPENSE: 'expense/UPDATE_EXPENSE',
  DELETE_EXPENSE: 'expense/DELETE_EXPENSE',
  RESET: 'expense/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IExpense>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ExpenseState = Readonly<typeof initialState>;

// Reducer

export default (state: ExpenseState = initialState, action): ExpenseState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXPENSE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_EXPENSE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_EXPENSE):
    case REQUEST(ACTION_TYPES.UPDATE_EXPENSE):
    case REQUEST(ACTION_TYPES.DELETE_EXPENSE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_EXPENSE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_EXPENSE):
    case FAILURE(ACTION_TYPES.CREATE_EXPENSE):
    case FAILURE(ACTION_TYPES.UPDATE_EXPENSE):
    case FAILURE(ACTION_TYPES.DELETE_EXPENSE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_EXPENSE):
    case SUCCESS(ACTION_TYPES.UPDATE_EXPENSE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_EXPENSE):
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

const apiUrl = 'api/expenses';

// Actions

export const getEntities: ICrudGetAllAction<IExpense> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSE_LIST,
    payload: axios.get<IExpense>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IExpense> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSE,
    payload: axios.get<IExpense>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IExpense> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_EXPENSE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IExpense> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IExpense> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_EXPENSE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
