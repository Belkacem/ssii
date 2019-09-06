import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/resource-configuration/resource-configuration.reducer';
import { IResourceConfiguration } from 'app/shared/model/resource-configuration.model';
import { cleanEntity } from 'app/shared/util/entity-utils';

const apiUrl = 'api/resource-configurations';

export const getByResource = (resourceId: number) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.FETCH_RESOURCECONFIGURATION,
    payload: axios.get(`${apiUrl}?resource_id=${resourceId}`)
  });

export const getAllByResources = (resourceId: number[]) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.FETCH_RESOURCECONFIGURATION_LIST,
    payload: axios.get(`${apiUrl}?resource_ids=${resourceId.join(',')}`)
  });

export const update = (resourceConfiguration: IResourceConfiguration) => async dispatch =>
  dispatch({
    type: ACTION_TYPES.UPDATE_RESOURCECONFIGURATION,
    payload: axios.put(apiUrl, cleanEntity(resourceConfiguration))
  });
