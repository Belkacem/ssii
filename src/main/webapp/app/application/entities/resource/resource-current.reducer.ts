import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { defaultValue } from 'app/shared/model/resource.model';

export const ACTION_TYPES = {
  CURRENT_RESOURCE: 'resource/resource-current/CURRENT_RESOURCE',
  RESET: 'resource/resource-current/RESET'
};

const initialState = {
  loading: false,
  errorMessage: null,
  entity: defaultValue
};

export type ResourceCurrentReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ResourceCurrentReducer = initialState, action): ResourceCurrentReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.CURRENT_RESOURCE):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.CURRENT_RESOURCE):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.CURRENT_RESOURCE):
      return {
        ...state,
        entity: action.payload.data,
        loading: false
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
