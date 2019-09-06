import axios from 'axios';
import { ACTION_TYPES } from 'app/shared/reducers/authentication';

export const loginAsUser = (login: string, callback: Function) => async dispatch => {
  const result = await dispatch({
    type: ACTION_TYPES.LOGIN,
    payload: axios.post(`api/authenticate/${login}`)
  });
  const bearerToken = result.value.headers.authorization;
  const AUTH_TOKEN_KEY = 'jhi-authenticationToken';
  if (bearerToken && bearerToken.slice(0, 7) === 'Bearer ') {
    const jwt = bearerToken.slice(7, bearerToken.length);
    localStorage.setItem(AUTH_TOKEN_KEY, jwt);
    callback('/app/home');
    location.reload();
  }
};
