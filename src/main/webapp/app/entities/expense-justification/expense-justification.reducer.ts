import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IExpenseJustification, defaultValue } from 'app/shared/model/expense-justification.model';

export const ACTION_TYPES = {
  FETCH_EXPENSEJUSTIFICATION_LIST: 'expenseJustification/FETCH_EXPENSEJUSTIFICATION_LIST',
  FETCH_EXPENSEJUSTIFICATION: 'expenseJustification/FETCH_EXPENSEJUSTIFICATION',
  CREATE_EXPENSEJUSTIFICATION: 'expenseJustification/CREATE_EXPENSEJUSTIFICATION',
  UPDATE_EXPENSEJUSTIFICATION: 'expenseJustification/UPDATE_EXPENSEJUSTIFICATION',
  DELETE_EXPENSEJUSTIFICATION: 'expenseJustification/DELETE_EXPENSEJUSTIFICATION',
  SET_BLOB: 'expenseJustification/SET_BLOB',
  RESET: 'expenseJustification/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IExpenseJustification>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ExpenseJustificationState = Readonly<typeof initialState>;

// Reducer

export default (state: ExpenseJustificationState = initialState, action): ExpenseJustificationState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION_LIST):
    case REQUEST(ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_EXPENSEJUSTIFICATION):
    case REQUEST(ACTION_TYPES.UPDATE_EXPENSEJUSTIFICATION):
    case REQUEST(ACTION_TYPES.DELETE_EXPENSEJUSTIFICATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION_LIST):
    case FAILURE(ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION):
    case FAILURE(ACTION_TYPES.CREATE_EXPENSEJUSTIFICATION):
    case FAILURE(ACTION_TYPES.UPDATE_EXPENSEJUSTIFICATION):
    case FAILURE(ACTION_TYPES.DELETE_EXPENSEJUSTIFICATION):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_EXPENSEJUSTIFICATION):
    case SUCCESS(ACTION_TYPES.UPDATE_EXPENSEJUSTIFICATION):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_EXPENSEJUSTIFICATION):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: {}
      };
    case ACTION_TYPES.SET_BLOB:
      const { name, data, contentType } = action.payload;
      return {
        ...state,
        entity: {
          ...state.entity,
          [name]: data,
          [name + 'ContentType']: contentType
        }
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};

const apiUrl = 'api/expense-justifications';

// Actions

export const getEntities: ICrudGetAllAction<IExpenseJustification> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION_LIST,
    payload: axios.get<IExpenseJustification>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IExpenseJustification> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION,
    payload: axios.get<IExpenseJustification>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IExpenseJustification> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_EXPENSEJUSTIFICATION,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IExpenseJustification> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSEJUSTIFICATION,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IExpenseJustification> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_EXPENSEJUSTIFICATION,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const setBlob = (name, data, contentType?) => ({
  type: ACTION_TYPES.SET_BLOB,
  payload: {
    name,
    data,
    contentType
  }
});

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
