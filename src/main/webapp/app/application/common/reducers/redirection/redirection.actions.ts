import { ACTION_TYPES } from './redirection.reducer';

// Actions
export const forceRedirect = link => ({
  type: ACTION_TYPES.FORCE_REDIRECTION,
  payload: link
});

export const setHomeLink = link => ({
  type: ACTION_TYPES.SET_HOME_LINK,
  payload: link
});
