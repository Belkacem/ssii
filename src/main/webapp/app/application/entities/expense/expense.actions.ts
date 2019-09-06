import { IExpense } from 'app/shared/model/expense.model';
import { ACTION_TYPES } from 'app/entities/expense/expense.reducer';
import { ACTION_TYPES as ACTION_TYPES_LIST } from './expense-list.reducer';
import { ACTION_TYPES as ACTION_TYPES_PENDING } from './expense-pending-list.reducer';
import axios from 'axios';
import { IRootState } from 'app/shared/reducers';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';
import { create as createJustification } from 'app/application/entities/expense-justification/expense-justification.actions';
import { FAILURE, REQUEST, SUCCESS } from 'app/shared/reducers/action-type.util';
import { IExpenseJustification } from 'app/shared/model/expense-justification.model';

const apiUrl = 'api/expenses';

// Actions
export const createExpense = (expense: IExpense, files: IExpenseJustification[]) => dispatch => {
  dispatch({ type: REQUEST(ACTION_TYPES.CREATE_EXPENSE) });
  axios
    .post(`${apiUrl}?override`, expense)
    .then(response => {
      if (files.length > 0) {
        const promises = [];
        files.map(f => {
          const justification = {
            expenseId: response.data.id,
            file: f.file,
            fileContentType: f.fileContentType
          };
          promises.push(dispatch(createJustification(justification)));
        });
        Promise.all(promises).then(() => {
          dispatch({ type: SUCCESS(ACTION_TYPES.CREATE_EXPENSE), payload: response });
        });
      } else {
        dispatch({ type: SUCCESS(ACTION_TYPES.CREATE_EXPENSE), payload: response });
      }
    })
    .catch(reason => {
      dispatch({ type: FAILURE(ACTION_TYPES.CREATE_EXPENSE), payload: reason });
    });
};

export const validateExpense = (expense: IExpense) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const validator = state.application.expenseValidator.current;
  dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSE,
    payload: axios.put(`${apiUrl}?override`, {
      ...expense,
      validatorId: validator.id
    })
  });
};

export const deleteExpense = expense_id => ({
  type: ACTION_TYPES.DELETE_EXPENSE,
  payload: axios.delete(`${apiUrl}/${expense_id}`)
});

export const getExpenses = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = await getState();
  const account = state.authentication.account;
  const company = state.application.company.current;
  let requestUrl = `${apiUrl}?override&companyId=${company.id}`;
  if (hasAnyAuthority(account.authorities, [AUTHORITIES.COMPANY_OWNER])) {
    requestUrl += `&validatorIdSpecified=true`;
  } else {
    const expenseValidator = state.application.expenseValidator.current;
    if (!!expenseValidator) {
      requestUrl += `&validatorId=${expenseValidator.id}`;
    }
  }
  return dispatch({
    type: ACTION_TYPES_LIST.FETCH_EXPENSE_LIST,
    payload: axios.get<IExpense>(
      `${requestUrl}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}&cacheBuster=${new Date().getTime()}`
    )
  });
};

export const getExpensesNotValid = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = await getState();
  const company = state.application.company.current;
  const requestUrl = `${apiUrl}?override&companyId=${company.id}&validatorIdSpecified=false`;
  return dispatch({
    type: ACTION_TYPES_PENDING.FETCH_PENDING_LIST,
    payload: axios.get<IExpense>(
      `${requestUrl}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}&cacheBuster=${new Date().getTime()}`
    )
  });
};

export const getExpensesByCurrentResource = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const currentResource = state.application.resource.current.entity;
  const requestUrl = `${apiUrl}?override&resourceIds=${currentResource.id}&validatorIdSpecified=true`;
  return dispatch({
    type: ACTION_TYPES_LIST.FETCH_EXPENSE_LIST,
    payload: axios.get<IExpense>(
      `${requestUrl}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}&cacheBuster=${new Date().getTime()}`
    )
  });
};

export const getExpensesNotValidByCurrentResource = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const currentResource = state.application.resource.current.entity;
  const requestUrl = `${apiUrl}?override&resourceIds=${currentResource.id}&validatorIdSpecified=false`;
  return dispatch({
    type: ACTION_TYPES_PENDING.FETCH_PENDING_LIST,
    payload: axios.get<IExpense>(
      `${requestUrl}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}&cacheBuster=${new Date().getTime()}`
    )
  });
};

export const countNotValidated = () => async dispatch => dispatch(getExpensesNotValid(0, 999, 'id,desc'));

export const reset = () => async dispatch => {
  dispatch({ type: ACTION_TYPES.RESET });
  dispatch({ type: ACTION_TYPES_LIST.RESET });
  dispatch({ type: ACTION_TYPES_PENDING.RESET });
};
