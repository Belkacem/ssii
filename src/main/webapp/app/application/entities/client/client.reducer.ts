import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { defaultValue } from 'app/shared/model/client.model';

export const ACTION_TYPES = {
  FETCH_CLIENT_BY_SIREN: 'ext/client/FETCH_CLIENT_BY_SIREN'
};

const initialState = {
  errorMessage: null,
  fetching: false,
  fetchedClient: defaultValue
};

export type ClientReducer = Readonly<typeof initialState>;

// Reducer

export default (state: ClientReducer = initialState, action): ClientReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_CLIENT_BY_SIREN):
      return {
        ...state,
        errorMessage: null,
        fetching: true
      };
    case FAILURE(ACTION_TYPES.FETCH_CLIENT_BY_SIREN):
      return {
        ...state,
        fetching: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_CLIENT_BY_SIREN):
      return {
        ...state,
        fetching: false,
        fetchedClient: action.payload.data
      };
    default:
      return state;
  }
};
