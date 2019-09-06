import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ACTION_TYPES } from 'app/entities/project-resource/project-resource.reducer';
import { IProjectResource } from 'app/shared/model/project-resource.model';

const apiUrl = 'api/project-resources';

// Actions
export const getByProject = (project_id, page, size, sort) => {
  const requestUrl = `${apiUrl}?override&projectIdIn=${project_id}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
    payload: axios.get<IProjectResource>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByProjects = (projects: number[], page, size, sort) => {
  const requestUrl = `${apiUrl}?override&projectIdIn=${projects.join(',')}${sort ? `&page=${page}&size=${size}&sort=${sort}` : ''}`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
    payload: axios.get<IProjectResource>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getProjectResourcesIdIn = ids => {
  const requestUrl = `${apiUrl}?override&idIn=${ids.join(',')}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
    payload: axios.get<IProjectResource>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByResource = resourceId => {
  const requestUrl = `${apiUrl}?override&resourceId=${resourceId}&page=0&size=999`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCE_LIST,
    payload: axios.get<IProjectResource>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const createProjectResource = entity => ({
  type: ACTION_TYPES.CREATE_PROJECTRESOURCE,
  payload: axios.post(`${apiUrl}?creation`, cleanEntity(entity))
});

export const updateProjectResource = entity => ({
  type: ACTION_TYPES.UPDATE_PROJECTRESOURCE,
  payload: axios.put(apiUrl, cleanEntity(entity))
});

export const deleteProjectResource = id => ({
  type: ACTION_TYPES.DELETE_PROJECTRESOURCE,
  payload: axios.delete(`${apiUrl}/${id}`)
});
