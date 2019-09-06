import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';
import { IExceptionalActivity } from 'app/shared/model/exceptional-activity.model';

export const ACTION_TYPES = {
  FETCH_EXCEPTIONALACTIVITIES_LIST: 'ext/exceptional-activities/FETCH_EXCEPTIONALACTIVITIES_LIST',
  UPDATE_EXCEPTIONALACTIVITIES: 'ext/exceptional-activities/UPDATE_EXCEPTIONALACTIVITIES',
  CREATE_EXCEPTIONALACTIVITIES: 'ext/exceptional-activities/CREATE_EXCEPTIONALACTIVITIES',
  DELETE_EXCEPTIONALACTIVITIES: 'ext/exceptional-activities/DELETE_EXCEPTIONALACTIVITIES',
  SET_LOADING: 'ext/exceptional-activities/SET_LOADING',
  SET_UPDATING: 'ext/exceptional-activities/SET_UPDATING',
  RESET: 'ext/exceptional-activities/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IExceptionalActivity>,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type ExceptionalActivityReducer = Readonly<typeof initialState>;

// Reducer

export default (state: ExceptionalActivityReducer = initialState, action): ExceptionalActivityReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false
      };
    case REQUEST(ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITIES):
    case REQUEST(ACTION_TYPES.CREATE_EXCEPTIONALACTIVITIES):
    case REQUEST(ACTION_TYPES.DELETE_EXCEPTIONALACTIVITIES):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false
      };
    case FAILURE(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST):
    case FAILURE(ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITIES):
    case FAILURE(ACTION_TYPES.CREATE_EXCEPTIONALACTIVITIES):
    case FAILURE(ACTION_TYPES.DELETE_EXCEPTIONALACTIVITIES):
      return {
        ...state,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_EXCEPTIONALACTIVITIES_LIST):
      return {
        ...state,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.UPDATE_EXCEPTIONALACTIVITIES):
    case SUCCESS(ACTION_TYPES.CREATE_EXCEPTIONALACTIVITIES):
    case SUCCESS(ACTION_TYPES.DELETE_EXCEPTIONALACTIVITIES):
      return {
        ...state,
        updateSuccess: true
      };
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    case ACTION_TYPES.SET_UPDATING:
      return {
        ...state,
        updating: action.payload
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
