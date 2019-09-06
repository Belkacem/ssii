import { ACTION_TYPES } from './ticket.reducer';
import axios from 'axios';
import * as AbsenceValidatorExt from 'app/application/entities/absence-validator/absence-validator.actions';
import * as ProjectValidatorExt from 'app/application/entities/project-validator/project-validator.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ExpenseValidatorExt from 'app/application/entities/expense-validator/expense-validator.actions';
import * as ProjectContractorExt from 'app/application/entities/project-contractor/project-contractor.actions';

export const ABSENCE_VALIDATOR_TICKET = 'absence-validator-ticket';

export const PROJECT_VALIDATOR_TICKET = 'project-validator-ticket';

export const RESOURCE_TICKET = 'resource-ticket';

export const EXPENSE_VALIDATOR_TICKET = 'expense-validator-ticket';

export const PROJECT_CONTRACTOR_TICKET = 'project-contractor-ticket';

export const TICKET = 'ticket';

export const checkTicket = () => dispatch => {
  const absenceValidatorTicket = getTicket(ABSENCE_VALIDATOR_TICKET);
  if (absenceValidatorTicket) {
    return dispatch({
      type: ACTION_TYPES.CHECK_ABSENCEVALIDATOR_TICKET,
      meta: absenceValidatorTicket,
      payload: axios.get(`api/ticket/${absenceValidatorTicket}/absence-validators`)
    }).catch(() => {
      cleanTicket(ABSENCE_VALIDATOR_TICKET);
    });
  }
  const projectValidatorTicket = getTicket(PROJECT_VALIDATOR_TICKET);
  if (projectValidatorTicket) {
    return dispatch({
      type: ACTION_TYPES.CHECK_PROJECTVALIDATOR_TICKET,
      meta: projectValidatorTicket,
      payload: axios.get(`api/ticket/${projectValidatorTicket}/project-validators`)
    }).catch(() => {
      cleanTicket(PROJECT_VALIDATOR_TICKET);
    });
  }
  const resourceTicket = getTicket(RESOURCE_TICKET);
  if (resourceTicket) {
    return dispatch({
      type: ACTION_TYPES.CHECK_RESOURCE_TICKET,
      meta: resourceTicket,
      payload: axios.get(`api/ticket/${resourceTicket}/resources`)
    }).catch(() => {
      cleanTicket(RESOURCE_TICKET);
    });
  }
  const expenseValidatorTicket = getTicket(EXPENSE_VALIDATOR_TICKET);
  if (expenseValidatorTicket) {
    return dispatch({
      type: ACTION_TYPES.CHECK_EXPENSEVALIDATOR_TICKET,
      meta: expenseValidatorTicket,
      payload: axios.get(`api/ticket/${expenseValidatorTicket}/expense-validators`)
    }).catch(() => {
      cleanTicket(EXPENSE_VALIDATOR_TICKET);
    });
  }
  const projectContractorTicket = getTicket(PROJECT_CONTRACTOR_TICKET);
  if (projectContractorTicket) {
    return dispatch({
      type: ACTION_TYPES.CHECK_PROJECTCONTRACTOR_TICKET,
      meta: projectContractorTicket,
      payload: axios.get(`api/ticket/${projectContractorTicket}/project-contractors`)
    }).catch(() => {
      cleanTicket(PROJECT_CONTRACTOR_TICKET);
    });
  }
};

export const storeTicket = (ticketType: string, ticket: string) => {
  localStorage.setItem(ticketType, ticket);
};

export const getTicket = (ticketType: string) => localStorage.getItem(ticketType);

export const cleanTicket = (ticketType: string = null) => {
  if (!!ticketType) {
    localStorage.removeItem(ticketType);
  } else {
    localStorage.removeItem(PROJECT_VALIDATOR_TICKET);
    localStorage.removeItem(ABSENCE_VALIDATOR_TICKET);
    localStorage.removeItem(RESOURCE_TICKET);
    localStorage.removeItem(EXPENSE_VALIDATOR_TICKET);
    localStorage.removeItem(PROJECT_CONTRACTOR_TICKET);
    localStorage.removeItem(TICKET);
  }
};

export const setChecking = (checking: boolean) => ({
  type: ACTION_TYPES.SET_CHECKING,
  payload: checking
});

export const checkNewTickets = () => async dispatch => {
  dispatch(setChecking(true));
  await Promise.all([
    ResourceExt.checkNewTicket(),
    AbsenceValidatorExt.checkNewTicket(),
    ExpenseValidatorExt.checkNewTicket(),
    ProjectContractorExt.checkNewTicket(),
    ProjectValidatorExt.checkNewTicket()
  ]);
  dispatch(setChecking(false));
};

export const hasStoredTicket = () =>
  !!getTicket(PROJECT_VALIDATOR_TICKET) ||
  !!getTicket(ABSENCE_VALIDATOR_TICKET) ||
  !!getTicket(RESOURCE_TICKET) ||
  !!getTicket(EXPENSE_VALIDATOR_TICKET) ||
  !!getTicket(PROJECT_CONTRACTOR_TICKET);

export const resetTicket = () => ({
  type: ACTION_TYPES.RESET_TICKET
});
