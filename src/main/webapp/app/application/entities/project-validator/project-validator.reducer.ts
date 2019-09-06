import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  CURRENTS_PROJECTVALIDATORS: 'projectValidator/CURRENTS_PROJECTVALIDATORS',
  ALL_PROJECTVALIDATORS: 'projectValidator/ALL_PROJECTVALIDATORS'
};

const initialState = {
  loading: false,
  errorMessage: null,
  currents: [],
  entitiesLoading: false,
  entitiesErrorMessage: null,
  entities: []
};

export type ProjectValidatorReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ProjectValidatorReducer = initialState, action): ProjectValidatorReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CURRENTS_PROJECTVALIDATORS):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CURRENTS_PROJECTVALIDATORS):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
        currents: []
      };
    case SUCCESS(ACTION_TYPES.CURRENTS_PROJECTVALIDATORS):
      return {
        ...state,
        loading: false,
        currents: action.payload.data
      };
    case REQUEST(ACTION_TYPES.ALL_PROJECTVALIDATORS):
      return {
        ...state,
        errorMessage: null,
        entitiesLoading: true
      };
    case FAILURE(ACTION_TYPES.ALL_PROJECTVALIDATORS):
      return {
        ...state,
        entitiesLoading: false,
        entitiesErrorMessage: action.payload,
        entities: []
      };
    case SUCCESS(ACTION_TYPES.ALL_PROJECTVALIDATORS):
      return {
        ...state,
        entitiesLoading: false,
        entities: action.payload.data
      };
    default:
      return state;
  }
};
