import axios from 'axios';
import { IClient } from 'app/shared/model/client.model';
import { ACTION_TYPES } from 'app/entities/client/client.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from 'app/application/entities/client/client.reducer';
import { IRootState } from 'app/shared/reducers';
import { cleanEntity } from 'app/shared/util/entity-utils';

const apiUrl = 'api/clients';

// Actions
export const getClients = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  const requestUrl = `${apiUrl}?override&companyId=${companyId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_CLIENT_LIST,
    payload: axios.get<IClient>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getClientsByIds = (ids: number[]) => {
  const requestUrl = `${apiUrl}?override&idIn=${ids.join(',')}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_CLIENT_LIST,
    payload: axios.get<IClient>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getClientBySiren = siren => ({
  type: ACTION_TYPES_EXT.FETCH_CLIENT_BY_SIREN,
  payload: axios.get(`${apiUrl}/siren/${siren}`)
});

export const createClient = (client: IClient) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_CLIENT,
    payload: axios.post(apiUrl, cleanEntity(client))
  });

export const updateClient = (client: IClient) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_CLIENT,
    payload: axios.put(apiUrl, cleanEntity(client))
  });

export const resetClient = () => ({
  type: ACTION_TYPES.RESET
});
