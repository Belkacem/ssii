import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { ICompany } from 'app/shared/model/company.model';
import { ACTION_TYPES } from 'app/entities/company/company.reducer';
import { ACTION_TYPES as ACTION_TYPES_EXT } from './company.reducer';
import { IRootState } from 'app/shared/reducers';
import { forceRedirect } from 'app/application/common/reducers/redirection/redirection.actions';

import * as AbsenceValidatorsExt from 'app/application/entities/absence-validator/absence-validator.actions';
import * as ProjectValidatorExt from 'app/application/entities/project-validator/project-validator.actions';
import * as ResourceExt from 'app/application/entities/resource/resource.actions';
import * as ExpenseValidatorExt from 'app/application/entities/expense-validator/expense-validator.actions';
import * as ProjectContractorExt from 'app/application/entities/project-contractor/project-contractor.actions';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';

const apiUrl = 'api/companies';

// Actions
export const getMyCompanies = () => async (dispatch, getState) => {
  dispatch(setSessionLoading(true));
  let state: IRootState = getState();
  const account = state.authentication.account;
  const isCompanyOwner = hasAnyAuthority(account.authorities, [AUTHORITIES.COMPANY_OWNER]);
  await dispatch({
    type: ACTION_TYPES.FETCH_COMPANY_LIST,
    payload: axios.get<ICompany[]>(`${apiUrl}?override&cacheBuster=${new Date().getTime()}`)
  });
  state = getState();
  if (state.company.entities.length > 0 || isCompanyOwner) {
    return dispatch(getSession());
  } else {
    return dispatch(setSessionLoading(false));
  }
};

export const fetchBySiren = siren => ({
  type: ACTION_TYPES_EXT.FETCH_COMPANY_BY_SIREN,
  payload: axios.get(`${apiUrl}/siren/${siren}`)
});

export const create = company => async (dispatch, getState) => {
  const state: IRootState = getState();
  const ownerId = state.authentication.account.id;
  await dispatch({
    type: ACTION_TYPES.CREATE_COMPANY,
    payload: axios.post(`${apiUrl}?override`, cleanEntity({ ...company, ownerId }))
  });
  return dispatch(getMyCompanies());
};

export const update = (company: ICompany) => async dispatch => {
  await dispatch({
    type: ACTION_TYPES.UPDATE_COMPANY,
    payload: axios.put('api/companies', cleanEntity(company))
  });
  return dispatch(getSession());
};

export const setSessionLoading = (loading: boolean) => ({
  type: ACTION_TYPES_EXT.SET_SESSION_LOADING,
  payload: loading
});

export const getSession = () => async (dispatch, getState) => {
  const state: IRootState = getState();
  dispatch(setSessionLoading(true));
  const account = state.authentication.account;
  const isCompanyOwner = hasAnyAuthority(account.authorities, [AUTHORITIES.COMPANY_OWNER]);
  if (state.company.entities.length === 0 && isCompanyOwner) {
    await dispatch(forceRedirect('/app/company/fetch-by-siren'));
  } else {
    if (state.application.redirection.forceRedirectLink !== null) {
      await dispatch(forceRedirect(null));
    }
    await dispatch({
      type: ACTION_TYPES_EXT.GET_SESSION,
      payload: axios.get(`${apiUrl}/current-company`)
    });
    await Promise.all([
      dispatch(ResourceExt.getCurrent()),
      dispatch(AbsenceValidatorsExt.getCurrent()),
      dispatch(ProjectValidatorExt.getCurrent()),
      dispatch(ExpenseValidatorExt.getCurrent()),
      dispatch(ProjectContractorExt.getCurrent())
    ]);
  }
  dispatch(setSessionLoading(false));
};

export const connect = companyId => async dispatch => {
  await dispatch({
    type: ACTION_TYPES_EXT.CONNECT_AS,
    payload: axios.put(`${apiUrl}/connect?company_id=${companyId}`)
  });
  return dispatch(getSession());
};

export const reset = () => ({
  type: ACTION_TYPES_EXT.RESET
});
