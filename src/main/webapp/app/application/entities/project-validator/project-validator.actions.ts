import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IProjectValidator } from 'app/shared/model/project-validator.model';
import { ACTION_TYPES } from 'app/entities/project-validator/project-validator.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './project-validator.reducer';
import { getSession } from 'app/shared/reducers/authentication';
import { IRootState } from 'app/shared/reducers';
import { cleanTicket, getTicket, PROJECT_VALIDATOR_TICKET, storeTicket } from 'app/application/common/reducers/ticket/ticket.actions';

const apiUrl = 'api/project-validators';

// Actions
export const getByProject = (project_id, page, size, sort) => {
  const requestUrl = `${apiUrl}?override&projectId.in=${project_id}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTVALIDATOR_LIST,
    payload: axios.get<IProjectValidator>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getAllProjectValidators = () => (dispatch, getState) => {
  const state: IRootState = getState();
  const projectIds = state.project.entities.map(p => p.id);
  if (projectIds.length > 0) {
    const requestUrl = `${apiUrl}?override&projectId.in=${projectIds.join(',')}&page=0&size=999&sort=id,desc`;
    return dispatch({
      type: ACTION_TYPES_EXT.ALL_PROJECTVALIDATORS,
      payload: axios.get<IProjectValidator>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
    });
  }
};

export const getByIdIn = ids => {
  const requestUrl = `${apiUrl}?override&idIn=${ids.join(',')}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTVALIDATOR_LIST,
    payload: axios.get<IProjectValidator>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const createProjectValidator = entity => ({
  type: ACTION_TYPES.CREATE_PROJECTVALIDATOR,
  payload: axios.post(`${apiUrl}?override`, cleanEntity(entity))
});

export const updateProjectValidator = entity => ({
  type: ACTION_TYPES.UPDATE_PROJECTVALIDATOR,
  payload: axios.put(`${apiUrl}?override`, cleanEntity(entity))
});

export const deleteProjectValidator = id => ({
  type: ACTION_TYPES.DELETE_PROJECTVALIDATOR,
  payload: axios.delete(`${apiUrl}/${id}`)
});

export const getCurrent = () => async (dispatch, getState) => {
  try {
    const state: IRootState = getState();
    const currentCompany = state.application.company.current;
    return await dispatch({
      type: ACTION_TYPES_EXT.CURRENTS_PROJECTVALIDATORS,
      payload: axios.get<IProjectValidator>(`${apiUrl}/current/${currentCompany.id}?cacheBuster=${new Date().getTime()}`)
    });
  } catch (e) {}
};

/**
 * PROJECT VALIDATOR BY TICKET
 */

export const assignAccount = () => async dispatch => {
  const ticket = getTicket(PROJECT_VALIDATOR_TICKET);
  await dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTVALIDATOR,
    payload: axios.put(`${apiUrl}?ticket=${ticket}`)
  });
  cleanTicket(PROJECT_VALIDATOR_TICKET);
  dispatch(getSession());
};

export const checkNewTicket = () => {
  cleanTicket(PROJECT_VALIDATOR_TICKET);
  return axios.get<IProjectValidator>(`${apiUrl}/new-tickets`).then(response => {
    const ticket = response.data.ticket;
    if (!!ticket) storeTicket(PROJECT_VALIDATOR_TICKET, ticket);
    return response;
  });
};

export const resendTicket = (projectValidator: IProjectValidator) => dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTVALIDATOR,
    payload: axios.get<IProjectValidator>(`${apiUrl}/resend-ticket/${projectValidator.id}`)
  });
