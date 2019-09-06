import { ICompany } from 'app/shared/model/company.model';
import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';

export const ACTION_TYPES = {
  GET_COMPANY_BY_HOST: 'domainName/GET_COMPANY_BY_HOST'
};

const initialState = {
  company: null as ICompany
};

export type DomainNameReducer = Readonly<typeof initialState>;

// Reducer
export default (state: DomainNameReducer = initialState, action): DomainNameReducer => {
  switch (action.type) {
    case REQUEST(ACTION_TYPES.GET_COMPANY_BY_HOST):
    case FAILURE(ACTION_TYPES.GET_COMPANY_BY_HOST):
      return {
        ...state,
        company: null
      };
    case SUCCESS(ACTION_TYPES.GET_COMPANY_BY_HOST):
      return {
        ...state,
        company: action.payload.data
      };
    default:
      return state;
  }
};
