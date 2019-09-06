import { ACTION_TYPES } from './domain-name.reducer';
import axios from 'axios';

// Actions
export const getCompanyByCurrentHost = () => dispatch =>
  dispatch({
    type: ACTION_TYPES.GET_COMPANY_BY_HOST,
    payload: axios.get(`api/host`)
  });
