import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IResourceContract } from 'app/shared/model/resource-contract.model';
import { ACTION_TYPES } from 'app/entities/resource-contract/resource-contract.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './resource-contract.reducer';
import { IRootState } from 'app/shared/reducers';

const apiUrl = 'api/resource-contracts';

// Actions

export const getByResource = (resource_id: number) => {
  const requestUrl = `${apiUrl}?override&page=0&size=999&sort=startDate,desc&resourceId=${resource_id}`;
  return {
    type: ACTION_TYPES.FETCH_RESOURCECONTRACT_LIST,
    payload: axios.get<IResourceContract>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getAllContracts = () => async (dispatch, getState) => {
  const state: IRootState = getState();
  const companyId = state.application.company.current.id;
  const requestUrl = `${apiUrl}?override&companyId=${companyId}&page=0&size=9999&sort=startDate,desc`;
  return dispatch({
    type: ACTION_TYPES_EXT.FETCH_RESOURCESCONTRACT_LIST,
    payload: axios.get<IResourceContract>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const createContract = (resourceContract: IResourceContract) => ({
  type: ACTION_TYPES.CREATE_RESOURCECONTRACT,
  payload: axios.post(apiUrl, cleanEntity(resourceContract))
});

export const updateContract = (resourceContract: IResourceContract) => ({
  type: ACTION_TYPES.UPDATE_RESOURCECONTRACT,
  payload: axios.put(apiUrl, cleanEntity(resourceContract))
});

export const deleteContract = (id: number) => ({
  type: ACTION_TYPES.DELETE_RESOURCECONTRACT,
  payload: axios.delete(`${apiUrl}/${id}`)
});

export const resetContracts = () => ({
  type: ACTION_TYPES.RESET
});
