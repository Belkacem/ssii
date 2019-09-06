import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IAbsence, defaultValue } from 'app/shared/model/absence.model';

export const ACTION_TYPES = {
  FETCH_ABSENCE_LIST: 'absence/FETCH_ABSENCE_LIST',
  FETCH_ABSENCE: 'absence/FETCH_ABSENCE',
  CREATE_ABSENCE: 'absence/CREATE_ABSENCE',
  UPDATE_ABSENCE: 'absence/UPDATE_ABSENCE',
  DELETE_ABSENCE: 'absence/DELETE_ABSENCE',
  RESET: 'absence/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IAbsence>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type AbsenceState = Readonly<typeof initialState>;

// Reducer

export default (state: AbsenceState = initialState, action): AbsenceState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ABSENCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ABSENCE):
    case REQUEST(ACTION_TYPES.UPDATE_ABSENCE):
    case REQUEST(ACTION_TYPES.DELETE_ABSENCE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ABSENCE):
    case FAILURE(ACTION_TYPES.CREATE_ABSENCE):
    case FAILURE(ACTION_TYPES.UPDATE_ABSENCE):
    case FAILURE(ACTION_TYPES.DELETE_ABSENCE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ABSENCE):
    case SUCCESS(ACTION_TYPES.UPDATE_ABSENCE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ABSENCE):
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

const apiUrl = 'api/absences';

// Actions

export const getEntities: ICrudGetAllAction<IAbsence> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCE_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IAbsence> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCE,
    payload: axios.get<IAbsence>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IAbsence> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ABSENCE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IAbsence> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IAbsence> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ABSENCE,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
