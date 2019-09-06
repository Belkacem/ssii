import { SUCCESS, REQUEST, FAILURE } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  CURRENT_ABSENCEVALIDATOR: 'absenceValidator/CURRENT_ABSENCEVALIDATOR'
};

const initialState = {
  loading: false,
  errorMessage: null,
  current: null
};

export type AbsenceValidatorReducer = Readonly<typeof initialState>;

// Reducer
export default (state: AbsenceValidatorReducer = initialState, action): AbsenceValidatorReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CURRENT_ABSENCEVALIDATOR):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CURRENT_ABSENCEVALIDATOR):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
        current: null
      };
    case SUCCESS(ACTION_TYPES.CURRENT_ABSENCEVALIDATOR):
      return {
        ...state,
        loading: false,
        current: action.payload.data
      };
    default:
      return state;
  }
};
