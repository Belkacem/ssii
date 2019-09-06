import axios from 'axios';
import { ICrudGetAction, ICrudGetAllAction, ICrudPutAction, ICrudDeleteAction } from 'app/shared/util/redux-action-utils';

import { cleanEntity } from 'app/shared/util/entity-utils';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

import { IInvoiceItem, defaultValue } from 'app/shared/model/invoice-item.model';

export const ACTION_TYPES = {
  FETCH_INVOICEITEM_LIST: 'invoiceItem/FETCH_INVOICEITEM_LIST',
  FETCH_INVOICEITEM: 'invoiceItem/FETCH_INVOICEITEM',
  CREATE_INVOICEITEM: 'invoiceItem/CREATE_INVOICEITEM',
  UPDATE_INVOICEITEM: 'invoiceItem/UPDATE_INVOICEITEM',
  DELETE_INVOICEITEM: 'invoiceItem/DELETE_INVOICEITEM',
  RESET: 'invoiceItem/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IInvoiceItem>,
  entity: defaultValue,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type InvoiceItemState = Readonly<typeof initialState>;

// Reducer

export default (state: InvoiceItemState = initialState, action): InvoiceItemState => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_INVOICEITEM_LIST):
    case REQUEST(ACTION_TYPES.FETCH_INVOICEITEM):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        loading: true
      };
    case REQUEST(ACTION_TYPES.CREATE_INVOICEITEM):
    case REQUEST(ACTION_TYPES.UPDATE_INVOICEITEM):
    case REQUEST(ACTION_TYPES.DELETE_INVOICEITEM):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false,
        updating: true
      };
    case FAILURE(ACTION_TYPES.FETCH_INVOICEITEM_LIST):
    case FAILURE(ACTION_TYPES.FETCH_INVOICEITEM):
    case FAILURE(ACTION_TYPES.CREATE_INVOICEITEM):
    case FAILURE(ACTION_TYPES.UPDATE_INVOICEITEM):
    case FAILURE(ACTION_TYPES.DELETE_INVOICEITEM):
      return {
        ...state,
        loading: false,
        updating: false,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_INVOICEITEM_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_INVOICEITEM):
      return {
        ...state,
        loading: false,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.CREATE_INVOICEITEM):
    case SUCCESS(ACTION_TYPES.UPDATE_INVOICEITEM):
      return {
        ...state,
        updating: false,
        updateSuccess: true,
        entity: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.DELETE_INVOICEITEM):
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

const apiUrl = 'api/invoice-items';

// Actions

export const getEntities: ICrudGetAllAction<IInvoiceItem> = (page, size, sort) => {
  const requestUrl = `${apiUrl}${sort ? `?page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_INVOICEITEM_LIST,
    payload: axios.get<IInvoiceItem>(`${requestUrl}${sort ? '&' : '?'}cacheBuster=${new Date().getTime()}`)
  };
};

export const getEntity: ICrudGetAction<IInvoiceItem> = id => {
  const requestUrl = `${apiUrl}/${id}`;
  return {
    type: ACTION_TYPES.FETCH_INVOICEITEM,
    payload: axios.get<IInvoiceItem>(requestUrl)
  };
};

export const createEntity: ICrudPutAction<IInvoiceItem> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.CREATE_INVOICEITEM,
    payload: axios.post(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const updateEntity: ICrudPutAction<IInvoiceItem> = entity => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.UPDATE_INVOICEITEM,
    payload: axios.put(apiUrl, cleanEntity(entity))
  });
  dispatch(getEntities());
  return result;
};

export const deleteEntity: ICrudDeleteAction<IInvoiceItem> = id => async dispatch => {
  const requestUrl = `${apiUrl}/${id}`;
  const result = await dispatch({
    type: ACTION_TYPES.DELETE_INVOICEITEM,
    payload: axios.delete(requestUrl)
  });
  dispatch(getEntities());
  return result;
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
