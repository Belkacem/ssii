import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';
import { IStandardActivity } from 'app/shared/model/standard-activity.model';

export const ACTION_TYPES = {
  FETCH_STANDARDACTIVITY_LIST: 'ext/standardActivity/FETCH_STANDARDACTIVITY_LIST',
  UPDATE_STANDARDACTIVITIES: 'ext/standard-activities/UPDATE_STANDARDACTIVITIES',
  CREATE_STANDARDACTIVITIES: 'ext/standard-activities/CREATE_STANDARDACTIVITIES',
  DELETE_STANDARDACTIVITIES: 'ext/standard-activities/DELETE_STANDARDACTIVITIES',
  SET_LOADING: 'ext/standard-activities/SET_LOADING',
  SET_UPDATING: 'ext/standard-activities/SET_UPDATING',
  RESET: 'ext/standardActivity/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entities: [] as ReadonlyArray<IStandardActivity>,
  updating: false,
  totalItems: 0,
  updateSuccess: false
};

export type StandardActivityReducer = Readonly<typeof initialState>;

// Reducer

export default (state: StandardActivityReducer = initialState, action): StandardActivityReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false
      };
    case REQUEST(ACTION_TYPES.UPDATE_STANDARDACTIVITIES):
    case REQUEST(ACTION_TYPES.CREATE_STANDARDACTIVITIES):
    case REQUEST(ACTION_TYPES.DELETE_STANDARDACTIVITIES):
      return {
        ...state,
        errorMessage: null,
        updateSuccess: false
      };
    case FAILURE(ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST):
    case FAILURE(ACTION_TYPES.UPDATE_STANDARDACTIVITIES):
    case FAILURE(ACTION_TYPES.CREATE_STANDARDACTIVITIES):
    case FAILURE(ACTION_TYPES.DELETE_STANDARDACTIVITIES):
      return {
        ...state,
        updateSuccess: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_STANDARDACTIVITY_LIST):
      return {
        ...state,
        totalItems: action.payload.headers['x-total-count'],
        entities: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.UPDATE_STANDARDACTIVITIES):
    case SUCCESS(ACTION_TYPES.CREATE_STANDARDACTIVITIES):
    case SUCCESS(ACTION_TYPES.DELETE_STANDARDACTIVITIES):
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
