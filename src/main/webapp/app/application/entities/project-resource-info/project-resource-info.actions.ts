import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/project-resource-info/project-resource-info.reducer';
import { IProjectResourceInfo } from 'app/shared/model/project-resource-info.model';

import * as ProjectResourceExt from 'app/application/entities/project-resource/project-resource.actions';
import * as ProjectExt from 'app/application/entities/project/project.actions';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IRootState } from 'app/shared/reducers';

const apiUrl = 'api/project-resource-infos';

// Actions
export const getByProjectResource = projectResourceId => {
  const requestUrl = `${apiUrl}?override&projectResourceIdIn=${projectResourceId}&page=0&size=999&sort=startDate,desc`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST,
    payload: axios.get<IProjectResourceInfo>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByProjectResources = projectResourceIds => {
  const requestUrl = `${apiUrl}?override&projectResourceIdIn=${projectResourceIds.join(',')}&page=0&size=999&sort=startDate,desc`;
  return {
    type: ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST,
    payload: axios.get<IProjectResourceInfo>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getByResource = resourceId => async (dispatch, getState) => {
  await dispatch(ProjectResourceExt.getByResource(resourceId));
  const state: IRootState = getState();
  const projectIds = state.projectResource.entities.map(pr => pr.projectId);
  if (projectIds.length > 0) {
    await dispatch(ProjectExt.getProjectsIdIn(projectIds));
    const projectResourceIds = state.projectResource.entities.map(pr => pr.id);
    if (projectResourceIds.length > 0) {
      const requestUrl = `${apiUrl}?override&projectResourceIdIn=${projectResourceIds.join(',')}&page=0&size=999&sort=startDate,desc`;
      return dispatch({
        type: ACTION_TYPES.FETCH_PROJECTRESOURCEINFO_LIST,
        payload: axios.get<IProjectResourceInfo>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
      });
    }
  }
};

export const createProjectResourceInfo = (entity: IProjectResourceInfo, months: string[] = []) => {
  const requestUrl = months.length > 0 ? `${apiUrl}?months=${months.join(',')}` : apiUrl;
  return {
    type: ACTION_TYPES.CREATE_PROJECTRESOURCEINFO,
    payload: axios.post(requestUrl, cleanEntity(entity))
  };
};

export const updateProjectResourceInfo = (entity: IProjectResourceInfo, months: string[] = []) => {
  const requestUrl = months.length > 0 ? `${apiUrl}?months=${months.join(',')}` : apiUrl;
  return {
    type: ACTION_TYPES.UPDATE_PROJECTRESOURCEINFO,
    payload: axios.put(requestUrl, cleanEntity(entity))
  };
};

export const deleteProjectResourceInfo = id => ({
  type: ACTION_TYPES.DELETE_PROJECTRESOURCEINFO,
  payload: axios.delete(`${apiUrl}/${id}`)
});
