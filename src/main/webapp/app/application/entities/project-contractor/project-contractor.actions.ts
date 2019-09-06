import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/project-contractor/project-contractor.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './project-contractor.reducer';
import { IProjectContractor } from 'app/shared/model/project-contractor.model';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { getSession } from 'app/shared/reducers/authentication';
import { IRootState } from 'app/shared/reducers';
import { cleanTicket, getTicket, PROJECT_CONTRACTOR_TICKET, storeTicket } from 'app/application/common/reducers/ticket/ticket.actions';

const apiUrl = 'api/project-contractors';

// Actions
export const getProjectContractors = (project_id, page, size, sort) => {
  const requestUrl = `${apiUrl}?override&projectId.in=${project_id}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTCONTRACTOR_LIST,
    payload: axios.get<IProjectContractor>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getAllProjectContractors = () => (dispatch, getState) => {
  const state: IRootState = getState();
  const projectIds = state.project.entities.map(p => p.id);
  if (projectIds.length > 0) {
    const requestUrl = `${apiUrl}?override&projectId.in=${projectIds.join(',')}&page=0&size=999&sort=id,desc`;
    return dispatch({
      type: ACTION_TYPES_EXT.ALL_PROJECTCONTRACTORS,
      payload: axios.get<IProjectContractor>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
    });
  }
};

export const createProjectContractor = entity => ({
  type: ACTION_TYPES.CREATE_PROJECTCONTRACTOR,
  payload: axios.post(`${apiUrl}?override`, cleanEntity(entity))
});

export const updateProjectContractor = entity => ({
  type: ACTION_TYPES.UPDATE_PROJECTCONTRACTOR,
  payload: axios.put(`${apiUrl}?override`, cleanEntity(entity))
});

export const deleteProjectContractor = id => ({
  type: ACTION_TYPES.DELETE_PROJECTCONTRACTOR,
  payload: axios.delete(`${apiUrl}/${id}`)
});

export const getCurrent = () => async (dispatch, getState) => {
  try {
    const state: IRootState = getState();
    const currentCompany = state.application.company.current;
    return await dispatch({
      type: ACTION_TYPES_EXT.CURRENTS_PROJECTCONTRACTORS,
      payload: axios.get<IProjectContractor>(`${apiUrl}/current/${currentCompany.id}?cacheBuster=${new Date().getTime()}`)
    });
  } catch (e) {}
};

/**
 * PROJECT CONTRACTOR BY TICKET
 */

export const assignAccount = () => async dispatch => {
  const ticket = getTicket(PROJECT_CONTRACTOR_TICKET);
  await dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTCONTRACTOR,
    payload: axios.put(`${apiUrl}?ticket=${ticket}`)
  });
  cleanTicket(PROJECT_CONTRACTOR_TICKET);
  dispatch(getSession());
};

export const checkNewTicket = () => {
  cleanTicket(PROJECT_CONTRACTOR_TICKET);
  return axios.get<IProjectContractor>(`${apiUrl}/new-tickets`).then(response => {
    const ticket = response.data.ticket;
    if (!!ticket) storeTicket(PROJECT_CONTRACTOR_TICKET, ticket);
    return response;
  });
};

export const resendTicket = (projectContractor: IProjectContractor) => dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_PROJECTCONTRACTOR,
    payload: axios.get<IProjectContractor>(`${apiUrl}/resend-ticket/${projectContractor.id}`)
  });
