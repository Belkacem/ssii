import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  DOWNLOAD_INVOICE: 'ext/invoice/DOWNLOAD_INVOICE',
  SEND_INVOICE_REMINDER: 'ext/invoice/SEND_INVOICE_REMINDER',
  SET_GENERATING: 'ext/invoice/SET_GENERATING',
  GENERATE_INVOICES: 'ext/invoice/GENERATE_INVOICES',
  FETCH_NETTING_INVOICE: 'ext/invoice/FETCH_NETTING_INVOICE',
  RESET: 'ext/invoice/RESET'
};

const initialState = {
  errorMessage: null,
  sending: false,
  pdf: null,
  downloading: false,
  generated: [],
  generating: false,
  loadingNetting: false,
  netting: null
};

export type InvoiceReducer = Readonly<typeof initialState>;

// Reducer
export default (state: InvoiceReducer = initialState, action): InvoiceReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.SEND_INVOICE_REMINDER):
      return {
        ...state,
        errorMessage: null,
        sending: true
      };
    case FAILURE(ACTION_TYPES.SEND_INVOICE_REMINDER):
      return {
        ...state,
        sending: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.SEND_INVOICE_REMINDER):
      return {
        ...state,
        sending: false
      };
    case REQUEST(ACTION_TYPES.DOWNLOAD_INVOICE):
      return {
        ...state,
        pdf: null,
        downloading: true
      };
    case FAILURE(ACTION_TYPES.DOWNLOAD_INVOICE):
      return {
        ...state,
        downloading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.DOWNLOAD_INVOICE):
      return {
        ...state,
        downloading: false,
        pdf: action.payload.data
      };
    case REQUEST(ACTION_TYPES.GENERATE_INVOICES):
      return {
        ...state,
        generated: []
      };
    case FAILURE(ACTION_TYPES.GENERATE_INVOICES):
      return {
        ...state,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.GENERATE_INVOICES):
      return {
        ...state,
        generated: action.payload.data
      };
    case ACTION_TYPES.SET_GENERATING:
      return {
        ...state,
        generating: action.payload
      };
    case REQUEST(ACTION_TYPES.FETCH_NETTING_INVOICE):
      return {
        ...state,
        loadingNetting: true
      };
    case FAILURE(ACTION_TYPES.FETCH_NETTING_INVOICE):
      return {
        ...state,
        loadingNetting: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_NETTING_INVOICE):
      return {
        ...state,
        loadingNetting: false,
        netting: action.payload.data
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
