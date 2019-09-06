import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IExpenseValidator, defaultValue } from 'app/shared/model/expense-validator.model';

export const ACTION_TYPES = {
  FETCH_EXPENSEVALIDATOR_LIST: 'expenseValidator/FETCH_EXPENSEVALIDATOR_LIST',
  FETCH_EXPENSEVALIDATOR: 'expenseValidator/FETCH_EXPENSEVALIDATOR',
  CREATE_EXPENSEVALIDATOR: 'expenseValidator/CREATE_EXPENSEVALIDATOR',
  UPDATE_EXPENSEVALIDATOR: 'expenseValidator/UPDATE_EXPENSEVALIDATOR',
  DELETE_EXPENSEVALIDATOR: 'expenseValidator/DELETE_EXPENSEVALIDATOR',
  RESET: 'expenseValidator/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IExpenseValidator>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ExpenseValidatorState = Readonly<typeof initialState>;

// Reducer

export default (state: ExpenseValidatorState = initialState, action): ExpenseValidatorState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXPENSEVALIDATOR_LIST):
    case REQUEST(ACTION_TYPES.FETCH_EXPENSEVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_EXPENSEVALIDATOR):
    case REQUEST(ACTION_TYPES.UPDATE_EXPENSEVALIDATOR):
    case REQUEST(ACTION_TYPES.DELETE_EXPENSEVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_EXPENSEVALIDATOR_LIST):
    case FAILURE(ACTION_TYPES.FETCH_EXPENSEVALIDATOR):
    case FAILURE(ACTION_TYPES.CREATE_EXPENSEVALIDATOR):
    case FAILURE(ACTION_TYPES.UPDATE_EXPENSEVALIDATOR):
    case FAILURE(ACTION_TYPES.DELETE_EXPENSEVALIDATOR):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSEVALIDATOR_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSEVALIDATOR):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_EXPENSEVALIDATOR):
    case SUCCESS(ACTION_TYPES.UPDATE_EXPENSEVALIDATOR):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_EXPENSEVALIDATOR):
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

const apiUrl = 'api/expense-validators';

// Actions

export const getEntities: ICrudGetAllAction<IExpenseValidator> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSEVALIDATOR_LIST,
    payload: axios.get<IExpenseValidator>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IExpenseValidator> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSEVALIDATOR,
    payload: axios.get<IExpenseValidator>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IExpenseValidator> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_EXPENSEVALIDATOR,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IExpenseValidator> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSEVALIDATOR,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IExpenseValidator> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_EXPENSEVALIDATOR,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
