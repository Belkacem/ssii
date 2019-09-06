import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IExpense } from 'app/shared/model/expense.model';

export const ACTION_TYPES = {
  FETCH_PENDING_LIST: 'ext/expense/FETCH_PENDING_LIST',
  RESET: 'ext/expense/RESET'
};

const initialState = {
  errorMessage: null,
  loading: false,
  entities: [] as ReadonlyArray<IExpense>,
  totalItems: 0
};

export type ExpensePendingListReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ExpensePendingListReducer = initialState, action): ExpensePendingListReducer => {
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
