import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IAbsence } from 'app/shared/model/absence.model';

export const ACTION_TYPES = {
  FETCH_PENDING_LIST: 'ext/absence/FETCH_PENDING_LIST',
  RESET: 'ext/absence/RESET'
};

const initialState = {
  errorMessage: null,
  loading: false,
  entities: [] as ReadonlyArray<IAbsence>,
  totalItems: 0
};

export type AbsencePendingListReducer = Readonly<typeof initialState>;

// Reducer
export default (state: AbsencePendingListReducer = initialState, action): AbsencePendingListReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PENDING_LIST):
      return {
        ...state,
        errorMessage: null,
        loading: true,
        totalItems: 0
      };
    case FAILURE(ACTION_TYPES.FETCH_PENDING_LIST):
      return {
        ...state,
        loading: false,
        totalItems: 0,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PENDING_LIST):
      return {
        ...state,
        loading: false,
        totalItems: parseInt(action.payload.headers['x-total-count'], 10),
        entities: action.payload.data
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
