import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IResourceContract, defaultValue } from 'app/shared/model/resource-contract.model';

export const ACTION_TYPES = {
  FETCH_RESOURCECONTRACT_LIST: 'resourceContract/FETCH_RESOURCECONTRACT_LIST',
  FETCH_RESOURCECONTRACT: 'resourceContract/FETCH_RESOURCECONTRACT',
  CREATE_RESOURCECONTRACT: 'resourceContract/CREATE_RESOURCECONTRACT',
  UPDATE_RESOURCECONTRACT: 'resourceContract/UPDATE_RESOURCECONTRACT',
  DELETE_RESOURCECONTRACT: 'resourceContract/DELETE_RESOURCECONTRACT',
  RESET: 'resourceContract/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IResourceContract>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ResourceContractState = Readonly<typeof initialState>;

// Reducer

export default (state: ResourceContractState = initialState, action): ResourceContractState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_RESOURCECONTRACT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_RESOURCECONTRACT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_RESOURCECONTRACT):
    case REQUEST(ACTION_TYPES.UPDATE_RESOURCECONTRACT):
    case REQUEST(ACTION_TYPES.DELETE_RESOURCECONTRACT):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_RESOURCECONTRACT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_RESOURCECONTRACT):
    case FAILURE(ACTION_TYPES.CREATE_RESOURCECONTRACT):
    case FAILURE(ACTION_TYPES.UPDATE_RESOURCECONTRACT):
    case FAILURE(ACTION_TYPES.DELETE_RESOURCECONTRACT):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCECONTRACT_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCECONTRACT):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_RESOURCECONTRACT):
    case SUCCESS(ACTION_TYPES.UPDATE_RESOURCECONTRACT):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_RESOURCECONTRACT):
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

const apiUrl = 'api/resource-contracts';

// Actions

export const getEntities: ICrudGetAllAction<IResourceContract> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_RESOURCECONTRACT_LIST,
    payload: axios.get<IResourceContract>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IResourceContract> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_RESOURCECONTRACT,
    payload: axios.get<IResourceContract>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IResourceContract> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_RESOURCECONTRACT,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IResourceContract> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCECONTRACT,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IResourceContract> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_RESOURCECONTRACT,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
