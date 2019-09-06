import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IResource } from 'app/shared/model/resource.model';
import { unionBy } from 'lodash';

export const ACTION_TYPES = {
  FETCH_RESOURCE: 'resource/resource-name/FETCH_RESOURCE',
  SET_LOADING: 'resource/resource-name/SET_LOADING',
  RESET: 'resource/resource-name/RESET'
};

const initialState = {
  loading: [],
  errorMessage: null,
  entities: [] as IResource[]
};

export type ResourceNameReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ResourceNameReducer = initialState, action): ResourceNameReducer => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: unionBy([{ id: action.scope, loading: action.payload }], state.loading, 'id')
      };
    case REQUEST(ACTION_TYPES.FETCH_RESOURCE):
      return {
        ...state,
        errorMessage: null
      };
    case FAILURE(ACTION_TYPES.FETCH_RESOURCE):
      return {
        ...state,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCE):
      state.entities[action.payload.data.id] = action.payload.data;
      return {
        ...state
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
