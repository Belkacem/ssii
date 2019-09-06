import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IAbsenceValidator, defaultValue } from 'app/shared/model/absence-validator.model';

export const ACTION_TYPES = {
  FETCH_ABSENCEVALIDATOR_LIST: 'absenceValidator/FETCH_ABSENCEVALIDATOR_LIST',
  FETCH_ABSENCEVALIDATOR: 'absenceValidator/FETCH_ABSENCEVALIDATOR',
  CREATE_ABSENCEVALIDATOR: 'absenceValidator/CREATE_ABSENCEVALIDATOR',
  UPDATE_ABSENCEVALIDATOR: 'absenceValidator/UPDATE_ABSENCEVALIDATOR',
  DELETE_ABSENCEVALIDATOR: 'absenceValidator/DELETE_ABSENCEVALIDATOR',
  RESET: 'absenceValidator/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IAbsenceValidator>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type AbsenceValidatorState = Readonly<typeof initialState>;

// Reducer

export default (state: AbsenceValidatorState = initialState, action): AbsenceValidatorState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEVALIDATOR_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ABSENCEVALIDATOR):
    case REQUEST(ACTION_TYPES.UPDATE_ABSENCEVALIDATOR):
    case REQUEST(ACTION_TYPES.DELETE_ABSENCEVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEVALIDATOR_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEVALIDATOR):
    case FAILURE(ACTION_TYPES.CREATE_ABSENCEVALIDATOR):
    case FAILURE(ACTION_TYPES.UPDATE_ABSENCEVALIDATOR):
    case FAILURE(ACTION_TYPES.DELETE_ABSENCEVALIDATOR):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEVALIDATOR_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEVALIDATOR):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ABSENCEVALIDATOR):
    case SUCCESS(ACTION_TYPES.UPDATE_ABSENCEVALIDATOR):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ABSENCEVALIDATOR):
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

const apiUrl = 'api/absence-validators';

// Actions

export const getEntities: ICrudGetAllAction<IAbsenceValidator> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEVALIDATOR_LIST,
    payload: axios.get<IAbsenceValidator>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IAbsenceValidator> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEVALIDATOR,
    payload: axios.get<IAbsenceValidator>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IAbsenceValidator> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ABSENCEVALIDATOR,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IAbsenceValidator> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCEVALIDATOR,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IAbsenceValidator> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ABSENCEVALIDATOR,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
