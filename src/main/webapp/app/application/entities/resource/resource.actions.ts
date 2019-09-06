import axios from 'axios';
import { SUCCESS } from 'app/shared/reducers/action-type.util';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/resource/resource.reducer';
import { ACTION_TYPES as ACTION_TYPES_CURRENT } from './resource-current.reducer';
import { ACTION_TYPES as ACTION_TYPES_NAME } from './resource-name.reducer';
import { IResource } from 'app/shared/model/resource.model';
import { forceRedirect } from 'app/application/common/reducers/redirection/redirection.actions';
import { IRootState } from 'app/shared/reducers';
import { getSession } from 'app/shared/reducers/authentication';
import { cleanTicket, getTicket, RESOURCE_TICKET, storeTicket } from 'app/application/common/reducers/ticket/ticket.actions';
import { getByResource as getProjectResources } from 'app/application/entities/project-resource/project-resource.actions';
import { getByResource as getResourceConfiguration } from 'app/application/entities/resource-configuration/resource-configuration.actions';
import { getByResource as getResourceContracts } from 'app/application/entities/resource-contract/resource-contract.actions';

const resourceApiUrl = 'api/resources';

export const create = resource => (dispatch, getState) => {
  const state: IRootState = getState();
  const company = state.application.company.current;
  dispatch({
    type: ACTION_TYPES.CREATE_RESOURCE,
    payload: axios.post(`${resourceApiUrl}?override`, {
      ...resource,
      companyId: company.id
    })
  });
};

export const invite = resourceEmail => (dispatch, getState) => {
  const state: IRootState = getState();
  const company = state.application.company.current;
  dispatch({
    type: ACTION_TYPES.CREATE_RESOURCE,
    payload: axios.post(`${resourceApiUrl}?override`, {
      email: resourceEmail,
      companyId: company.id
    })
  });
};

export const resendTicket = (resource: IResource) => dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCE,
    payload: axios.get<IResource>(`${resourceApiUrl}/resend-ticket/${resource.id}`)
  });

export const update = resource => dispatch => {
  dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCE,
    payload: axios.put(`${resourceApiUrl}?override`, cleanEntity(resource)).then(res => {
      dispatch(getById(resource.id, true));
      return res;
    })
  });
};

export const deleteBulk = (resource_ids: any[]) => ({
  type: ACTION_TYPES.DELETE_RESOURCE,
  payload: axios.delete(`${resourceApiUrl}/bulk?ids=${resource_ids.join(',')}`)
});

export const completeProfile = resource => dispatch => {
  dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCE,
    payload: axios.put(`${resourceApiUrl}?override`, cleanEntity(resource)).then(res => {
      dispatch(getCurrent());
      return res;
    })
  });
};

export const getById = (id: number, forced = false) => (dispatch, getState) => {
  const state: IRootState = getState();
  const resource = !forced && state.application.resource.name.entities[id];
  dispatch({
    type: ACTION_TYPES_NAME.SET_LOADING,
    scope: id,
    payload: true
  });
  if (!!resource) {
    dispatch({
      type: SUCCESS(ACTION_TYPES.FETCH_RESOURCE),
      payload: { data: resource }
    });
    dispatch({
      type: SUCCESS(ACTION_TYPES_NAME.FETCH_RESOURCE),
      payload: { data: resource }
    });
    dispatch({
      type: ACTION_TYPES_NAME.SET_LOADING,
      scope: id,
      payload: false
    });
  } else {
    dispatch({
      type: ACTION_TYPES.FETCH_RESOURCE,
      payload: axios.get<IResource>(`${resourceApiUrl}/${id}`).then(res => {
        dispatch({
          type: SUCCESS(ACTION_TYPES_NAME.FETCH_RESOURCE),
          payload: { data: res.data }
        });
        dispatch({
          type: ACTION_TYPES_NAME.SET_LOADING,
          scope: id,
          payload: false
        });
        return res;
      })
    });
  }
};

export const getAll = () => (dispatch, getState) => {
  const state: IRootState = getState();
  if (!!state.application.company.current) {
    const companyId = state.application.company.current.id;
    const requestUrl = `${resourceApiUrl}?override&companyId=${companyId}&page=0&size=999&sort=id,asc`;
    dispatch({
      type: ACTION_TYPES.FETCH_RESOURCE_LIST,
      payload: axios.get<IResource[]>(`${requestUrl}&cacheBuster=${new Date().getTime()}`).then(res => {
        res.data.forEach(resource => {
          dispatch({
            type: SUCCESS(ACTION_TYPES_NAME.FETCH_RESOURCE),
            payload: { data: resource }
          });
        });
        return res;
      })
    });
  }
};

export const getCurrent = () => async (dispatch, getState) => {
  try {
    let state: IRootState = getState();
    const currentCompany = state.application.company.current;
    await dispatch({
      type: ACTION_TYPES_CURRENT.CURRENT_RESOURCE,
      payload: axios.get<IResource>(`${resourceApiUrl}/current/${currentCompany.id}?cacheBuster=${new Date().getTime()}`).then(res => {
        if (res.data.draft) {
          dispatch(forceRedirect('/app/resource/create-profile'));
        } else if (state.application.redirection.forceRedirectLink === '/app/resource/create-profile') {
          dispatch(forceRedirect(null));
        }
        return res;
      })
    });
    state = getState();
    const current = state.application.resource.current.entity;
    if (!!current && !!current.id) {
      return Promise.all([
        dispatch(getProjectResources(current.id)),
        dispatch(getResourceConfiguration(current.id)),
        dispatch(getResourceContracts(current.id))
      ]);
    }
  } catch (e) {}
};

export const assignAccount = () => dispatch => {
  const ticket = getTicket(RESOURCE_TICKET);
  dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCE,
    payload: axios.put(`${resourceApiUrl}?ticket=${ticket}`).then(res => {
      cleanTicket(RESOURCE_TICKET);
      dispatch(getSession());
      return res;
    })
  });
};

export const checkNewTicket = () => {
  cleanTicket(RESOURCE_TICKET);
  return axios.get<IResource>(`${resourceApiUrl}/new-tickets`).then(response => {
    const ticket = response.data.ticket;
    if (!!ticket) storeTicket(RESOURCE_TICKET, ticket);
    return response;
  });
};

export const reset = () => ({
  type: ACTION_TYPES.RESET
});
