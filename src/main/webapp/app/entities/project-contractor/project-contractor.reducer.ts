import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IProjectContractor, defaultValue } from 'app/shared/model/project-contractor.model';

export const ACTION_TYPES = {
  FETCH_PROJECTCONTRACTOR_LIST: 'projectContractor/FETCH_PROJECTCONTRACTOR_LIST',
  FETCH_PROJECTCONTRACTOR: 'projectContractor/FETCH_PROJECTCONTRACTOR',
  CREATE_PROJECTCONTRACTOR: 'projectContractor/CREATE_PROJECTCONTRACTOR',
  UPDATE_PROJECTCONTRACTOR: 'projectContractor/UPDATE_PROJECTCONTRACTOR',
  DELETE_PROJECTCONTRACTOR: 'projectContractor/DELETE_PROJECTCONTRACTOR',
  RESET: 'projectContractor/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IProjectContractor>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ProjectContractorState = Readonly<typeof initialState>;

// Reducer

export default (state: ProjectContractorState = initialState, action): ProjectContractorState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PROJECTCONTRACTOR_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECTCONTRACTOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_PROJECTCONTRACTOR):
    case REQUEST(ACTION_TYPES.UPDATE_PROJECTCONTRACTOR):
    case REQUEST(ACTION_TYPES.DELETE_PROJECTCONTRACTOR):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_PROJECTCONTRACTOR_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECTCONTRACTOR):
    case FAILURE(ACTION_TYPES.CREATE_PROJECTCONTRACTOR):
    case FAILURE(ACTION_TYPES.UPDATE_PROJECTCONTRACTOR):
    case FAILURE(ACTION_TYPES.DELETE_PROJECTCONTRACTOR):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTCONTRACTOR_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECTCONTRACTOR):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_PROJECTCONTRACTOR):
    case SUCCESS(ACTION_TYPES.UPDATE_PROJECTCONTRACTOR):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_PROJECTCONTRACTOR):
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

const apiUrl = 'api/project-contractors';

// Actions

export const getEntities: ICrudGetAllAction<IProjectContractor> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTCONTRACTOR_LIST,
    payload: axios.get<IProjectContractor>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IProjectContractor> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTCONTRACTOR,
    payload: axios.get<IProjectContractor>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IProjectContractor> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_PROJECTCONTRACTOR,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IProjectContractor> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTCONTRACTOR,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IProjectContractor> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_PROJECTCONTRACTOR,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
