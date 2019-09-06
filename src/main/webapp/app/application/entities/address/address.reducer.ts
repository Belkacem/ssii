import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IAddress } from './address.model';
import { dataToAddresses } from './address.utils';

export const ACTION_TYPES = {
  FETCH_ADDRESS: 'ext/address/FETCH_ADDRESS',
  RESET: 'ext/address/RESET'
};

const initialState = {
  loading: null,
  entities: [] as ReadonlyArray<IAddress>
};

export type AddressReducer = Readonly<typeof initialState>;

// Reducer
export default (state: AddressReducer = initialState, action): AddressReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.FETCH_ADDRESS):
      return {
        ...state,
        loading: true
      };
    case FAILURE(ACTION_TYPES.FETCH_ADDRESS):
      return {
        ...state,
        loading: false
      };
    case SUCCESS(ACTION_TYPES.FETCH_ADDRESS):
      return {
        ...state,
        loading: false,
        entities: dataToAddresses(action.payload.data)
      };
    case ACTION_TYPES.RESET:
      return {
        ...initialState
      };
    default:
      return state;
  }
};
