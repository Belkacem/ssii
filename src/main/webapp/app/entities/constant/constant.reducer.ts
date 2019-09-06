import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IConstant, defaultValue } from 'app/shared/model/constant.model';

export const ACTION_TYPES = {
  FETCH_CONSTANT_LIST: 'constant/FETCH_CONSTANT_LIST',
  FETCH_CONSTANT: 'constant/FETCH_CONSTANT',
  CREATE_CONSTANT: 'constant/CREATE_CONSTANT',
  UPDATE_CONSTANT: 'constant/UPDATE_CONSTANT',
  DELETE_CONSTANT: 'constant/DELETE_CONSTANT',
  RESET: 'constant/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IConstant>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ConstantState = Readonly<typeof initialState>;

// Reducer

export default (state: ConstantState = initialState, action): ConstantState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_CONSTANT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_CONSTANT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_CONSTANT):
    case REQUEST(ACTION_TYPES.UPDATE_CONSTANT):
    case REQUEST(ACTION_TYPES.DELETE_CONSTANT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_CONSTANT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CONSTANT):
    case FAILURE(ACTION_TYPES.CREATE_CONSTANT):
    case FAILURE(ACTION_TYPES.UPDATE_CONSTANT):
    case FAILURE(ACTION_TYPES.DELETE_CONSTANT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_CONSTANT_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_CONSTANT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_CONSTANT):
    case SUCCESS(ACTION_TYPES.UPDATE_CONSTANT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_CONSTANT):
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

const apiUrl = 'api/constants';

// Actions

export const getEntities: ICrudGetAllAction<IConstant> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_CONSTANT_LIST,
    payload: axios.get<IConstant>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IConstant> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_CONSTANT,
    payload: axios.get<IConstant>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IConstant> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_CONSTANT,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IConstant> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_CONSTANT,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IConstant> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_CONSTANT,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
