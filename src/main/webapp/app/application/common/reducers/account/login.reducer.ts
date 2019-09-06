export const ACTION_TYPES = {
  SET_LOGIN_USERNAME: 'authentication/SET_LOGIN_USERNAME'
};

const initialState = {
  username: null as string
};

export type LoginReducer = Readonly<typeof initialState>;

// Reducer
export default (state: LoginReducer = initialState, action): LoginReducer => {
  switch (action.type) {
    case ACTION_TYPES.SET_LOGIN_USERNAME:
      return {
        ...state,
        username: action.payload
      };
    default:
      return state;
  }
};

export const setLoginUsername = (username: string) => dispatch =>
  dispatch({
    type: ACTION_TYPES.SET_LOGIN_USERNAME,
    payload: username
  });
