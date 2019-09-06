import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IAbsenceType, defaultValue } from 'app/shared/model/absence-type.model';

export const ACTION_TYPES = {
  FETCH_ABSENCETYPE_LIST: 'absenceType/FETCH_ABSENCETYPE_LIST',
  FETCH_ABSENCETYPE: 'absenceType/FETCH_ABSENCETYPE',
  CREATE_ABSENCETYPE: 'absenceType/CREATE_ABSENCETYPE',
  UPDATE_ABSENCETYPE: 'absenceType/UPDATE_ABSENCETYPE',
  DELETE_ABSENCETYPE: 'absenceType/DELETE_ABSENCETYPE',
  RESET: 'absenceType/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IAbsenceType>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type AbsenceTypeState = Readonly<typeof initialState>;

// Reducer

export default (state: AbsenceTypeState = initialState, action): AbsenceTypeState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCETYPE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ABSENCETYPE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ABSENCETYPE):
    case REQUEST(ACTION_TYPES.UPDATE_ABSENCETYPE):
    case REQUEST(ACTION_TYPES.DELETE_ABSENCETYPE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCETYPE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ABSENCETYPE):
    case FAILURE(ACTION_TYPES.CREATE_ABSENCETYPE):
    case FAILURE(ACTION_TYPES.UPDATE_ABSENCETYPE):
    case FAILURE(ACTION_TYPES.DELETE_ABSENCETYPE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCETYPE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCETYPE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ABSENCETYPE):
    case SUCCESS(ACTION_TYPES.UPDATE_ABSENCETYPE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ABSENCETYPE):
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

const apiUrl = 'api/absence-types';

// Actions

export const getEntities: ICrudGetAllAction<IAbsenceType> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCETYPE_LIST,
    payload: axios.get<IAbsenceType>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IAbsenceType> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCETYPE,
    payload: axios.get<IAbsenceType>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IAbsenceType> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ABSENCETYPE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IAbsenceType> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCETYPE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IAbsenceType> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ABSENCETYPE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
