import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { defaultValue } from 'app/shared/model/company.model';

export const ACTION_TYPES = {
  FETCH_COMPANY_BY_SIREN: 'ext/company/FETCH_COMPANY_BY_SIREN',
  GET_SESSION: 'ext/company/GET_SESSION',
  CONNECT_AS: 'ext/company/CONNECT_AS',
  SET_SESSION_LOADING: 'ext/company/SET_SESSION_LOADING',
  RESET: 'ext/company/RESET'
};

const initialState = {
  errorMessage: null,
  current: null,
  loading_current: false,
  session_loading: false,
  fetching: false,
  fetched: defaultValue
};

export type CompanyReducer = Readonly<typeof initialState>;

// Reducer
export default (state: CompanyReducer = initialState, action): CompanyReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_COMPANY_BY_SIREN):
      return {
        ...state,
        errorMessage: null,
        fetching: true
      };
    case FAILURE(ACTION_TYPES.FETCH_COMPANY_BY_SIREN):
      return {
        ...state,
        fetching: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_COMPANY_BY_SIREN):
      return {
        ...state,
        fetching: false,
        fetched: action.payload.data
      };
    case REQUEST(ACTION_TYPES.CONNECT_AS):
    case REQUEST(ACTION_TYPES.GET_SESSION):
      return {
        ...state,
        loading_current: true,
        current: null
      };
    case FAILURE(ACTION_TYPES.CONNECT_AS):
    case FAILURE(ACTION_TYPES.GET_SESSION):
      return {
        ...state,
        loading_current: false
      };
    case SUCCESS(ACTION_TYPES.GET_SESSION):
      return {
        ...state,
        current: action.payload.data,
        loading_current: false
      };
    case ACTION_TYPES.SET_SESSION_LOADING:
      return {
        ...state,
        session_loading: action.payload
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState,
        current: state.current
      };
    default:
      return state;
  }
};
