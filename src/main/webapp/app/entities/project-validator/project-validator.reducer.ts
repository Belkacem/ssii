import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IProjectValidator, defaultValue } from 'app/shared/model/project-validator.model';

export const ACTION_TYPES = {
  FETCH_PROJECTVALIDATOR_LIST: 'projectValidator/FETCH_PROJECTVALIDATOR_LIST',
  FETCH_PROJECTVALIDATOR: 'projectValidator/FETCH_PROJECTVALIDATOR',
  CREATE_PROJECTVALIDATOR: 'projectValidator/CREATE_PROJECTVALIDATOR',
  UPDATE_PROJECTVALIDATOR: 'projectValidator/UPDATE_PROJECTVALIDATOR',
  DELETE_PROJECTVALIDATOR: 'projectValidator/DELETE_PROJECTVALIDATOR',
  RESET: 'projectValidator/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IProjectValidator>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ProjectValidatorState = Readonly<typeof initialState>;

// Reducer

export default (state: ProjectValidatorState = initialState, action): ProjectValidatorState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PROJECTVALIDATOR_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECTVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_PROJECTVALIDATOR):
    case REQUEST(ACTION_TYPES.UPDATE_PROJECTVALIDATOR):
    case REQUEST(ACTION_TYPES.DELETE_PROJECTVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PROJECTVALIDATOR_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECTVALIDATOR):
    case FAILURE(ACTION_TYPES.CREATE_PROJECTVALIDATOR):
    case FAILURE(ACTION_TYPES.UPDATE_PROJECTVALIDATOR):
    case FAILURE(ACTION_TYPES.DELETE_PROJECTVALIDATOR):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTVALIDATOR_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTVALIDATOR):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PROJECTVALIDATOR):
    case SUCCESS(ACTION_TYPES.UPDATE_PROJECTVALIDATOR):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PROJECTVALIDATOR):
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

const apiUrl = 'api/project-validators';

// Actions

export const getEntities: ICrudGetAllAction<IProjectValidator> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTVALIDATOR_LIST,
    payload: axios.get<IProjectValidator>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IProjectValidator> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTVALIDATOR,
    payload: axios.get<IProjectValidator>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IProjectValidator> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PROJECTVALIDATOR,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IProjectValidator> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTVALIDATOR,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IProjectValidator> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PROJECTVALIDATOR,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
