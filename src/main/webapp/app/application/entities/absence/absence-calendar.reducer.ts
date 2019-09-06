import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IAbsence } from 'app/shared/model/absence.model';

export const ACTION_TYPES = {
  FETCH_ABSENCE_LIST: 'ext/absence-calendar/FETCH_ABSENCE_LIST',
  RESET: 'ext/absence-calendar/RESET'
};

const initialState = {
  errorMessage: null,
  loading: false,
  entities: [] as ReadonlyArray<IAbsence>,
  totalItems: 0
};

export type AbsenceCalendarReducer = Readonly<typeof initialState>;

// Reducer
export default (state: AbsenceCalendarReducer = initialState, action): AbsenceCalendarReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ABSENCE_LIST):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ABSENCE_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_ABSENCE_LIST):
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
