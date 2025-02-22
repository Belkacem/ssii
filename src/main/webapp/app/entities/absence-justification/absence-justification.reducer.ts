import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IAbsenceJustification, defaultValue } from 'app/shared/model/absence-justification.model';

export const ACTION_TYPES = {
  FETCH_ABSENCEJUSTIFICATION_LIST: 'absenceJustification/FETCH_ABSENCEJUSTIFICATION_LIST',
  FETCH_ABSENCEJUSTIFICATION: 'absenceJustification/FETCH_ABSENCEJUSTIFICATION',
  CREATE_ABSENCEJUSTIFICATION: 'absenceJustification/CREATE_ABSENCEJUSTIFICATION',
  UPDATE_ABSENCEJUSTIFICATION: 'absenceJustification/UPDATE_ABSENCEJUSTIFICATION',
  DELETE_ABSENCEJUSTIFICATION: 'absenceJustification/DELETE_ABSENCEJUSTIFICATION',
  SET_BLOB: 'absenceJustification/SET_BLOB',
  RESET: 'absenceJustification/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IAbsenceJustification>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type AbsenceJustificationState = Readonly<typeof initialState>;

// Reducer

export default (state: AbsenceJustificationState = initialState, action): AbsenceJustificationState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION_LIST):
    case REQUEST(ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_ABSENCEJUSTIFICATION):
    case REQUEST(ACTION_TYPES.UPDATE_ABSENCEJUSTIFICATION):
    case REQUEST(ACTION_TYPES.DELETE_ABSENCEJUSTIFICATION):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION_LIST):
    case FAILURE(ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION):
    case FAILURE(ACTION_TYPES.CREATE_ABSENCEJUSTIFICATION):
    case FAILURE(ACTION_TYPES.UPDATE_ABSENCEJUSTIFICATION):
    case FAILURE(ACTION_TYPES.DELETE_ABSENCEJUSTIFICATION):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_ABSENCEJUSTIFICATION):
    case SUCCESS(ACTION_TYPES.UPDATE_ABSENCEJUSTIFICATION):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_ABSENCEJUSTIFICATION):
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

const apiUrl = 'api/absence-justifications';

// Actions

export const getEntities: ICrudGetAllAction<IAbsenceJustification> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION_LIST,
    payload: axios.get<IAbsenceJustification>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IAbsenceJustification> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION,
    payload: axios.get<IAbsenceJustification>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IAbsenceJustification> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_ABSENCEJUSTIFICATION,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IAbsenceJustification> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCEJUSTIFICATION,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IAbsenceJustification> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_ABSENCEJUSTIFICATION,
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
