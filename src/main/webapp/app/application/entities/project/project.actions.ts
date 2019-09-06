import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/project/project.reducer';
import { ACTION_TYPES as ACTION_TYPES_LIST } from './project-list.reducer';
import { IProject } from 'app/shared/model/project.model';
import { IRootState } from 'app/shared/reducers';
import { IClient } from 'app/shared/model/client.model';

const apiUrl = 'api/projects';

// Actions
export const getProjectsList = (page, size, sort) => async (dispatch, getState) => {
  dispatch({ type: ACTION_TYPES_LIST.SET_LOADING, payload: true });
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  const cacheBuster = `&cacheBuster=${new Date().getTime()}`;
  const requestUrl = `${apiUrl}?override&companyId=${companyId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  const result = await dispatch({
    type: ACTION_TYPES_LIST.FETCH_PROJECT_LIST,
    payload: axios.get<IProject>(`${requestUrl}${cacheBuster}`)
  });
  dispatch({
    type: ACTION_TYPES_LIST.FETCH_CLIENT_LIST,
    payload: axios.get<IClient>(`api/clients?override&companyId=${companyId}&page=0&size=999${cacheBuster}`)
  });
  dispatch({ type: ACTION_TYPES_LIST.SET_LOADING, payload: false });
  return result;
};

export const getProjects = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  const requestUrl = `${apiUrl}?override&companyId=${companyId}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  await dispatch({
    type: ACTION_TYPES.FETCH_PROJECT_LIST,
    payload: axios.get<IProject>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getProjectsIdIn = ids => {
  const requestUrl = `${apiUrl}?override&idIn=${ids.join(',')}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_PROJECT_LIST,
    payload: axios.get<IProject>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const createProject = (project: IProject) => ({
  type: ACTION_TYPES.CREATE_PROJECT,
  payload: axios.post(`${apiUrl}?override`, cleanEntity(project))
});

export const updateProject = (project: IProject) => ({
  type: ACTION_TYPES.UPDATE_PROJECT,
  payload: axios.put(apiUrl, cleanEntity(project))
});
