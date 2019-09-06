import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/absence-validator/absence-validator.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './absence-validator.reducer';
import { getSession } from 'app/shared/reducers/authentication';
import { IAbsenceValidator } from 'app/shared/model/absence-validator.model';
import { IRootState } from 'app/shared/reducers';
import { ABSENCE_VALIDATOR_TICKET, cleanTicket, getTicket, storeTicket } from 'app/application/common/reducers/ticket/ticket.actions';

const apiUrl = 'api/absence-validators';

// Actions
export const getEntities = (page, size, sort) => {
  const requestUrl = `${apiUrl}?override${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEVALIDATOR_LIST,
    payload: axios.get<IAbsenceValidator>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const createEntity = entity => (dispatch, getState) => {
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  dispatch({
    type: ACTION_TYPES.CREATE_ABSENCEVALIDATOR,
    payload: axios.post(`${apiUrl}?override`, cleanEntity({ ...entity, companyId }))
  });
};

export const updateEntity = entity => ({
  type: ACTION_TYPES.UPDATE_ABSENCEVALIDATOR,
  payload: axios.put(`${apiUrl}?override`, cleanEntity(entity))
});

export const deleteEntity = (id: number) => ({
  type: ACTION_TYPES.DELETE_ABSENCEVALIDATOR,
  payload: axios.delete(`${apiUrl}/${id}`)
});

export const getCurrent = () => async (dispatch, getState) => {
  try {
    const state: IRootState = getState();
    const currentCompany = state.application.company.current;
    return await dispatch({
      type: ACTION_TYPES_EXT.CURRENT_ABSENCEVALIDATOR,
      payload: axios.get<IAbsenceValidator>(`${apiUrl}/current/${currentCompany.id}?cacheBuster=${new Date().getTime()}`)
    });
  } catch (e) {}
};

export const assignAccount = () => async dispatch => {
  const ticket = getTicket(ABSENCE_VALIDATOR_TICKET);
  await dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCEVALIDATOR,
    payload: axios.put(`${apiUrl}?ticket=${ticket}`)
  });
  cleanTicket(ABSENCE_VALIDATOR_TICKET);
  dispatch(getSession());
};

export const checkNewTicket = () => {
  cleanTicket(ABSENCE_VALIDATOR_TICKET);
  return axios.get<IAbsenceValidator>(`${apiUrl}/new-tickets`).then(response => {
    const ticket = response.data.ticket;
    if (!!ticket) storeTicket(ABSENCE_VALIDATOR_TICKET, ticket);
    return response;
  });
};

export const resendTicket = (absenceValidator: IAbsenceValidator) => dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCEVALIDATOR,
    payload: axios.get<IAbsenceValidator>(`${apiUrl}/resend-ticket/${absenceValidator.id}`)
  });
