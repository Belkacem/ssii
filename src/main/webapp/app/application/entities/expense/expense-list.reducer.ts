import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IExpense } from 'app/shared/model/expense.model';

export const ACTION_TYPES = {
  FETCH_EXPENSE_LIST: 'ext/expense/FETCH_EXPENSE_LIST',
  RESET: 'ext/expense/RESET'
};

const initialState = {
  errorMessage: null,
  loading: false,
  entities: [] as ReadonlyArray<IExpense>,
  totalItems: 0
};

export type ExpenseListReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ExpenseListReducer = initialState, action): ExpenseListReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXPENSE_LIST):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_EXPENSE_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXPENSE_LIST):
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
