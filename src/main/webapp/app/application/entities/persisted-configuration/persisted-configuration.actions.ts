import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/persisted-configuration/persisted-configuration.reducer';
import { IPersistedConfiguration } from 'app/shared/model/persisted-configuration.model';
import { IRootState } from 'app/shared/reducers';

const apiUrl = 'api/persisted-configurations';

// Actions

export const getMyConfigurations = () => async (dispatch, getState) => {
  const state: IRootState = getState();
  const user = state.authentication.account;
  const requestUrl = `${apiUrl}?override&page=0&size=999&userId=${user.id}`;
  return dispatch({
    type: ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION_LIST,
    payload: axios.get<IPersistedConfiguration>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getByKey = key => {
  const requestUrl = `${apiUrl}?override&page=0&size=999&key=${key}`;
  return {
    type: ACTION_TYPES.FETCH_PERSISTEDCONFIGURATION_LIST,
    payload: axios.get<IPersistedConfiguration>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const update = (configuration: IPersistedConfiguration) => ({
  type: ACTION_TYPES.UPDATE_PERSISTEDCONFIGURATION,
  payload: axios.put(apiUrl, cleanEntity(configuration))
});

export const create = (configuration: IPersistedConfiguration) => ({
  type: ACTION_TYPES.CREATE_PERSISTEDCONFIGURATION,
  payload: axios.post(apiUrl, cleanEntity(configuration))
});

export const save = (configuration: IPersistedConfiguration) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const user = state.authentication.account;
  if (configuration && configuration.id) {
    await dispatch(update(configuration));
  } else {
    await dispatch(create({ ...configuration, userId: user.id }));
  }
  return dispatch(getMyConfigurations());
};
