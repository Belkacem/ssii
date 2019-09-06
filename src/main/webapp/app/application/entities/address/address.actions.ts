import { ACTION_TYPES } from './address.reducer';
import axios from 'axios';

const apiUrl = 'api/address';

// Actions

export const fetch = query => ({
  type: ACTION_TYPES.FETCH_ADDRESS,
  payload: axios.get(`${apiUrl}?q=${query}`)
});

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
