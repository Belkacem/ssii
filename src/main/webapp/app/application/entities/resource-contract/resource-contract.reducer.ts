import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IResourceContract } from 'app/shared/model/resource-contract.model';

export const ACTION_TYPES = {
  FETCH_RESOURCESCONTRACT_LIST: 'ext/resourceContract/FETCH_RESOURCESCONTRACT_LIST'
};

const initialState = {
  loading: false,
  errorMessage: null,
  totalItems: 0,
  resourcesContracts: [] as ReadonlyArray<IResourceContract>
};

export type ResourceContractReducer = Readonly<typeof initialState>;

// Reducer
export default (state: ResourceContractReducer = initialState, action): ResourceContractReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_RESOURCESCONTRACT_LIST):
      return {
        ...state,
        errorMessage: null,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_RESOURCESCONTRACT_LIST):
      return {
        ...state,
        loading: false,
        errorMessage: action.payload
      };
    case SUCCESS(ACTION_TYPES.FETCH_RESOURCESCONTRACT_LIST):
      return {
        ...state,
        loading: false,
        totalItems: action.payload.headers['x-total-count'],
        resourcesContracts: action.payload.data
      };
    default:
      return state;
  }
};
