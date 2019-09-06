import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IAbsence } from 'app/shared/model/absence.model';

export const ACTION_TYPES = {
  FETCH_DISABLED_LIST: 'ext/absence/FETCH_DISABLED_LIST',
  RESET: 'ext/absence/RESET'
};

const initialState = {
  errorMessage: null,
  loading: false,
  entities: [] as ReadonlyArray<IAbsence>,
  totaltems: 0
};

export type AbsenceDisabledListReducer = Readonly<typeof initialState>;

// Reducer
export default (state: AbsenceDisabledListReducer = initialState, action): AbsenceDisabledListReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_DISABLED_LIST):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_DISABLED_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_DISABLED_LIST):
      return {
        ...state,
        loading: false,
        totaltems: parseInt(action.payload.headers['x-total-count'], 10),
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
