import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  CURRENTS_PROJECTCONTRACTORS: 'projectContractor/CURRENTS_PROJECTCONTRACTORS',
  ALL_PROJECTCONTRACTORS: 'projectContractor/ALL_PROJECTCONTRACTORS'
};

const initialState = {
  loading: false,
  errorMessage: null,
  currents: [],
  entitiesLoading: false,
  entitiesErrorMessage: null,
  entities: []
};

export type ProjectContractorReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ProjectContractorReducer = initialState, action): ProjectContractorReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CURRENTS_PROJECTCONTRACTORS):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CURRENTS_PROJECTCONTRACTORS):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload,
        currents: []
      };
    case SUCCESS(ACTION_TYPES.CURRENTS_PROJECTCONTRACTORS):
      return {
        ...state,
        loading: false,
        currents: action.payload.data
      };
    case REQUEST(ACTION_TYPES.ALL_PROJECTCONTRACTORS):
      return {
        ...state,
        errorMessage: null,
        entitiesLoading: true
      };
    case FAILURE(ACTION_TYPES.ALL_PROJECTCONTRACTORS):
      return {
        ...state,
        entitiesLoading: false,
        entitiesErrorMessage: action.payload,
        entities: []
      };
    case SUCCESS(ACTION_TYPES.ALL_PROJECTCONTRACTORS):
      return {
        ...state,
        entitiesLoading: false,
        entities: action.payload.data
      };
    default:
      return state;
  }
};
