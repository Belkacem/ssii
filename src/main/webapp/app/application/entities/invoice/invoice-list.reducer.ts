import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IInvoice } from 'app/shared/model/invoice.model';
import { IProject } from 'app/shared/model/project.model';
import { IClient } from 'app/shared/model/client.model';
import { IInvoiceItem } from 'app/shared/model/invoice-item.model';
import { unionBy } from 'lodash';

export const ACTION_TYPES = {
  FETCH_INVOICE_LIST: 'invoiceList/FETCH_INVOICE_LIST',
  FETCH_PROJECT_LIST: 'invoiceList/FETCH_PROJECT_LIST',
  FETCH_CLIENT_LIST: 'invoiceList/FETCH_CLIENT_LIST',
  FETCH_INVOICEITEM_LIST: 'invoiceList/FETCH_INVOICEITEM_LIST',
  SET_LOADING: 'invoiceList/SET_LOADING'
};

const initialState = {
  loading: false,
  errorMessage: null,
  totalItems: 0,
  invoices: [] as ReadonlyArray<IInvoice>,
  projects: [] as ReadonlyArray<IProject>,
  clients: [] as ReadonlyArray<IClient>,
  invoiceItems: [] as ReadonlyArray<IInvoiceItem>
};

export type InvoiceListReducer = Readonly<typeof initialState>;

// Reducer
export default (state: InvoiceListReducer = initialState, action): InvoiceListReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_INVOICE_LIST):
    case REQUEST(ACTION_TYPES.FETCH_PROJECT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_CLIENT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_INVOICEITEM_LIST):
      return {
        ...state,
        errorMessage: null
      };
    case FAILURE(ACTION_TYPES.FETCH_INVOICE_LIST):
    case FAILURE(ACTION_TYPES.FETCH_PROJECT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CLIENT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_INVOICEITEM_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_INVOICE_LIST):
      return {
        ...state,
        totalItems: action.payload.headers['x-total-count'],
        invoices: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECT_LIST):
      return {
        ...state,
        projects: unionBy(action.payload.data, state.projects, 'id')
      };
    case SUCCESS(ACTION_TYPES.FETCH_CLIENT_LIST):
      return {
        ...state,
        clients: unionBy(action.payload.data, state.clients, 'id')
      };
    case SUCCESS(ACTION_TYPES.FETCH_INVOICEITEM_LIST):
      return {
        ...state,
        invoiceItems: unionBy(action.payload.data, state.invoiceItems, 'id')
      };
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};
