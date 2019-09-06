export const ACTION_TYPES = {
  SET_ACCOUNT_TYPE: 'account/SET_ACCOUNT_TYPE'
};

const initialState = {
  type: undefined as number
};

export type AccountTypeReducer = Readonly<typeof initialState>;

// Reducer
export default (state: AccountTypeReducer = initialState, action): AccountTypeReducer => {
  switch (action.type) {
    case ACTION_TYPES.SET_ACCOUNT_TYPE:
      return {
        ...state,
        type: action.payload
      };
    default:
      return state;
  }
};

export const setAccountType = (accountType: number) => dispatch =>
  dispatch({
    type: ACTION_TYPES.SET_ACCOUNT_TYPE,
    payload: accountType
  });
