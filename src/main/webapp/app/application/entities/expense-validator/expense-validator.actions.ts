import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/expense-validator/expense-validator.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './expense-validator.reducer';
import { getSession } from 'app/shared/reducers/authentication';
import { IExpenseValidator } from 'app/shared/model/expense-validator.model';
import { IRootState } from 'app/shared/reducers';
import { EXPENSE_VALIDATOR_TICKET, cleanTicket, getTicket, storeTicket } from 'app/application/common/reducers/ticket/ticket.actions';

const apiUrl = 'api/expense-validators';

// Actions
export const getEntities = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const currentCompany = state.application.company.current;
  const requestUrl = `${apiUrl}?override&company_id=${currentCompany.id}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return dispatch({
    type: ACTION_TYPES.FETCH_EXPENSEVALIDATOR_LIST,
    payload: axios.get<IExpenseValidator>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const createEntity = (expenseValidator: IExpenseValidator) => (dispatch, getState) => {
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  dispatch({
    type: ACTION_TYPES.CREATE_EXPENSEVALIDATOR,
    payload: axios.post(`${apiUrl}?override`, cleanEntity({ ...expenseValidator, companyId }))
  });
};

export const updateEntity = (expenseValidator: IExpenseValidator) => ({
  type: ACTION_TYPES.UPDATE_EXPENSEVALIDATOR,
  payload: axios.put(`${apiUrl}?override`, cleanEntity(expenseValidator))
});

export const deleteEntity = (id: number) => ({
  type: ACTION_TYPES.DELETE_EXPENSEVALIDATOR,
  payload: axios.delete(`${apiUrl}/${id}`)
});

export const getCurrent = () => async (dispatch, getState) => {
  try {
    const state: IRootState = getState();
    const currentCompany = state.application.company.current;
    return await dispatch({
      type: ACTION_TYPES_EXT.CURRENT_EXPENSEVALIDATOR,
      payload: axios.get<IExpenseValidator>(`${apiUrl}/current/${currentCompany.id}?cacheBuster=${new Date().getTime()}`)
    });
  } catch (e) {}
};

export const assignAccount = () => async dispatch => {
  const ticket = getTicket(EXPENSE_VALIDATOR_TICKET);
  await dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSEVALIDATOR,
    payload: axios.put(`${apiUrl}?ticket=${ticket}`)
  });
  cleanTicket(EXPENSE_VALIDATOR_TICKET);
  dispatch(getSession());
};

export const checkNewTicket = () => {
  cleanTicket(EXPENSE_VALIDATOR_TICKET);
  return axios.get<IExpenseValidator>(`${apiUrl}/new-tickets`).then(response => {
    const ticket = response.data.ticket;
    if (!!ticket) storeTicket(EXPENSE_VALIDATOR_TICKET, ticket);
    return response;
  });
};

export const resendTicket = (expenseValidator: IExpenseValidator) => dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_EXPENSEVALIDATOR,
    payload: axios.get<IExpenseValidator>(`${apiUrl}/resend-ticket/${expenseValidator.id}`)
  });
