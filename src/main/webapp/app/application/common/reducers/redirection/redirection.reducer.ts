export const ACTION_TYPES = {
  SET_HOME_LINK: 'redirection/SET_HOME_LINK',
  FORCE_REDIRECTION: 'redirection/FORCE_REDIRECTION'
};

const initialState = {
  homeLink: null as string,
  forceRedirectLink: null as string
};

export type RedirectionReducer = Readonly<typeof initialState>;

// Reducer
export default (state: RedirectionReducer = initialState, action): RedirectionReducer => {
  switch (action.type) {
    case ACTION_TYPES.SET_HOME_LINK:
      return {
        ...state,
        homeLink: action.payload
      };
    case ACTION_TYPES.FORCE_REDIRECTION:
      return {
        ...state,
        forceRedirectLink: action.payload
      };
    default:
      return state;
  }
};
