import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IInvoiceFile, defaultValue } from 'app/shared/model/invoice-file.model';

export const ACTION_TYPES = {
  FETCH_INVOICEFILE_LIST: 'invoiceFile/FETCH_INVOICEFILE_LIST',
  FETCH_INVOICEFILE: 'invoiceFile/FETCH_INVOICEFILE',
  CREATE_INVOICEFILE: 'invoiceFile/CREATE_INVOICEFILE',
  UPDATE_INVOICEFILE: 'invoiceFile/UPDATE_INVOICEFILE',
  DELETE_INVOICEFILE: 'invoiceFile/DELETE_INVOICEFILE',
  SET_BLOB: 'invoiceFile/SET_BLOB',
  RESET: 'invoiceFile/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IInvoiceFile>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type InvoiceFileState = Readonly<typeof initialState>;

// Reducer

export default (state: InvoiceFileState = initialState, action): InvoiceFileState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_INVOICEFILE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_INVOICEFILE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_INVOICEFILE):
    case REQUEST(ACTION_TYPES.UPDATE_INVOICEFILE):
    case REQUEST(ACTION_TYPES.DELETE_INVOICEFILE):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_INVOICEFILE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_INVOICEFILE):
    case FAILURE(ACTION_TYPES.CREATE_INVOICEFILE):
    case FAILURE(ACTION_TYPES.UPDATE_INVOICEFILE):
    case FAILURE(ACTION_TYPES.DELETE_INVOICEFILE):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_INVOICEFILE_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_INVOICEFILE):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_INVOICEFILE):
    case SUCCESS(ACTION_TYPES.UPDATE_INVOICEFILE):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_INVOICEFILE):
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

const apiUrl = 'api/invoice-files';

// Actions

export const getEntities: ICrudGetAllAction<IInvoiceFile> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_INVOICEFILE_LIST,
    payload: axios.get<IInvoiceFile>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IInvoiceFile> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_INVOICEFILE,
    payload: axios.get<IInvoiceFile>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IInvoiceFile> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_INVOICEFILE,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IInvoiceFile> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_INVOICEFILE,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IInvoiceFile> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_INVOICEFILE,
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
