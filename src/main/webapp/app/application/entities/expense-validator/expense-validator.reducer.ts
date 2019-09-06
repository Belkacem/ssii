import { SUCCESS, REQUEST, FAILURE } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  CURRENT_EXPENSEVALIDATOR: 'expenseValidator/CURRENT_EXPENSEVALIDATOR'
};

const initialState = {
  loading: false,
  errorMessage: null,
  current: null
};

export type ExpenseValidatorReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ExpenseValidatorReducer = initialState, action): ExpenseValidatorReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CURRENT_EXPENSEVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CURRENT_EXPENSEVALIDATOR):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
        current: null
      };
    case SUCCESS(ACTION_TYPES.CURRENT_EXPENSEVALIDATOR):
      return {
        ...state,
        loading: false,
        current: action.payload.data
      };
    default:
      return state;
  }
};
