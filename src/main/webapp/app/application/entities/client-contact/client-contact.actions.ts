import { ACTION_TYPES } from 'app/entities/client-contact/client-contact.reducer';
import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IClientContact } from 'app/shared/model/client-contact.model';

const apiUrl = 'api/client-contacts';

// Actions
export const getClientContactsByClientIds = (clientIds: number[], sort = 'id=desc') => {
  const requestUrl = `${apiUrl}?override&clientIdIn=${clientIds.join(',')}&page=0&size=999&sort=${sort}`;
  return {
    type: ACTION_TYPES.FETCH_CLIENTCONTACT_LIST,
    payload: axios.get<IClientContact>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const createClientContact = (clientContact: IClientContact) => dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_CLIENTCONTACT,
    payload: axios.post(apiUrl, cleanEntity(clientContact))
  });

export const updateClientContact = (clientContact: IClientContact) => dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_CLIENTCONTACT,
    payload: axios.put(apiUrl, cleanEntity(clientContact))
  });

export const deleteClientContact = (id: number) => dispatch =>
  dispatch({
    type: ACTION_TYPES.DELETE_CLIENTCONTACT,
    payload: axios.delete(`${apiUrl}/${id}`)
  });

export const resetClientContact = () => ({
  type: ACTION_TYPES.RESET
});
