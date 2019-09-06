import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IProject } from 'app/shared/model/project.model';
import { IClient } from 'app/shared/model/client.model';

export const ACTION_TYPES = {
  FETCH_PROJECT_LIST: 'projectList/FETCH_PROJECT_LIST',
  FETCH_CLIENT_LIST: 'projectList/FETCH_CLIENT_LIST',
  SET_LOADING: 'projectList/SET_LOADING'
};

const initialState = {
  loading: false,
  errorMessage: null,
  projects: [] as ReadonlyArray<IProject>,
  totalItems: 0,
  clients: [] as ReadonlyArray<IClient>
};

export type ProjectListReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ProjectListReducer = initialState, action): ProjectListReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_PROJECT_LIST):
    case REQUEST(ACTION_TYPES.FETCH_CLIENT_LIST):
      return {
        ...state,
        errorMessage: null
      };
    case FAILURE(ACTION_TYPES.FETCH_PROJECT_LIST):
    case FAILURE(ACTION_TYPES.FETCH_CLIENT_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_PROJECT_LIST):
      return {
        ...state,
        totalItems: action.payload.headers['x-total-count'],
        projects: action.payload.data
      };
    case SUCCESS(ACTION_TYPES.FETCH_CLIENT_LIST):
      return {
        ...state,
        clients: action.payload.data
      };
    case ACTION_TYPES.SET_LOADING:
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};
