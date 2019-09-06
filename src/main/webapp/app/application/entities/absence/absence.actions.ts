import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/absence/absence.reducer';
import { ACTION_TYPES as ACTION_TYPES_LIST } from './absence-list.reducer';
import { ACTION_TYPES as ACTION_TYPES_PENDING } from './absence-pending-list.reducer';
import { ACTION_TYPES as ACTION_TYPES_DISABLED } from './absence-disabled-list.reducer';
import { ACTION_TYPES as ACTION_TYPES_CALENDAR } from './absence-calendar.reducer';
import { create as createJustification } from 'app/application/entities/absence-justification/absence-justification.actions';
import { hasAnyAuthority } from 'app/application/common/utils/user-utils';
import { IAbsence } from 'app/shared/model/absence.model';
import { IAbsenceJustification } from 'app/shared/model/absence-justification.model';
import { AUTHORITIES } from 'app/application/common/config/constants';
import { IRootState } from 'app/shared/reducers';
import moment, { Moment } from 'moment';
import { REQUEST, SUCCESS, FAILURE } from 'app/shared/reducers/action-type.util';

const apiUrl = 'api/absences';

// Actions
export const create = (absence: IAbsence, files: IAbsenceJustification[]) => dispatch => {
  dispatch({ type: REQUEST(ACTION_TYPES.CREATE_ABSENCE) });
  axios
    .post(`${apiUrl}?override`, absence)
    .then(response => {
      if (files.length > 0) {
        const promises = [];
        files.map(f => {
          const justification = {
            absenceId: response.data.id,
            file: f.file,
            fileContentType: f.fileContentType
          };
          promises.push(dispatch(createJustification(justification)));
        });
        Promise.all(promises).then(() => {
          dispatch({ type: SUCCESS(ACTION_TYPES.CREATE_ABSENCE), payload: response });
        });
      } else {
        dispatch({ type: SUCCESS(ACTION_TYPES.CREATE_ABSENCE), payload: response });
      }
    })
    .catch(reason => {
      dispatch({ type: FAILURE(ACTION_TYPES.CREATE_ABSENCE), payload: reason });
    });
};

export const approve = (absence: IAbsence) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const validator = state.application.absenceValidator.current;
  dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCE,
    payload: axios.put(`${apiUrl}?override`, {
      ...absence,
      validatorId: validator.id,
      validationDate: moment(),
      validationStatus: 'APPROVED'
    })
  });
};

export const reject = (absence: IAbsence) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const validator = state.application.absenceValidator.current;
  dispatch({
    type: ACTION_TYPES.UPDATE_ABSENCE,
    payload: axios.put(`${apiUrl}?override`, {
      ...absence,
      validatorId: validator.id,
      validationDate: moment(),
      validationStatus: 'REJECTED'
    })
  });
};

export const deleteAbsence = absence_id => ({
  type: ACTION_TYPES.DELETE_ABSENCE,
  payload: axios.delete(`${apiUrl}/${absence_id}`)
});

export const getAbsences = (page, size, sort) => (dispatch, getState) => {
  const state: IRootState = getState();
  const account = state.authentication.account;
  const company = state.application.company.current;
  let requestUrl = `${apiUrl}?override&validationStatusIn=APPROVED,REJECTED&companyId=${company.id}${
    sort ? `&page=${page}&size=${size}&sort=${sort}` : ''
  }`;
  if (!hasAnyAuthority(account.authorities, [AUTHORITIES.COMPANY_OWNER])) {
    const absenceValidator = state.application.absenceValidator.current;
    if (!!absenceValidator) {
      requestUrl += `&validatorIdIn=${absenceValidator.id}`;
    }
  }
  return dispatch({
    type: ACTION_TYPES_LIST.FETCH_ABSENCE_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getDisabledByResource = resource_id => {
  const requestUrl = `${apiUrl}?override&page=0&size=999&validationStatusIn=APPROVED,PENDING&submissionDateSpecified=true&resourceId=${resource_id}`;
  return {
    type: ACTION_TYPES_DISABLED.FETCH_DISABLED_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const getPending = (page, size, sort) => (dispatch, getState) => {
  const state: IRootState = getState();
  const company = state.application.company.current;
  const requestUrl = `${apiUrl}?override&validationStatusIn=PENDING&companyId=${company.id}${
    sort ? `&page=${page}&size=${size}&sort=${sort}` : ''
  }`;
  return dispatch({
    type: ACTION_TYPES_PENDING.FETCH_PENDING_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getByCurrentResource = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const currentResource = state.application.resource.current.entity;
  const requestUrl = `${apiUrl}?override&resourceId=${currentResource.id}&validationStatusIn=APPROVED,REJECTED${
    sort ? `&page=${page}&size=${size}&sort=${sort}` : ''
  }`;
  return dispatch({
    type: ACTION_TYPES_LIST.FETCH_ABSENCE_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getPendingByCurrentResource = (page, size, sort) => async (dispatch, getState) => {
  const state: IRootState = getState();
  const currentResource = state.application.resource.current.entity;
  const requestUrl = `${apiUrl}?override&resourceId=${currentResource.id}&validationStatusIn=PENDING${
    sort ? `&page=${page}&size=${size}&sort=${sort}` : ''
  }`;
  return dispatch({
    type: ACTION_TYPES_PENDING.FETCH_PENDING_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const getDisabledByCurrentResource = () => async (dispatch, getState) => {
  const state: IRootState = getState();
  const currentResource = state.application.resource.current.entity;
  return dispatch(getDisabledByResource(currentResource.id));
};

export const countNotValidated = () => async dispatch => dispatch(getPending(0, 999, 'id,desc'));

export const getAbsencesByMonth = (resourceIds: number[], month: Moment) => dispatch => {
  const requestUrl = `${apiUrl}?override&month=${month.format('YYYY-MM-DD')}&resourceIdIn=${resourceIds}&page=0&size=999&sort=start`;
  return dispatch({
    type: ACTION_TYPES_CALENDAR.FETCH_ABSENCE_LIST,
    payload: axios.get<IAbsence>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  });
};

export const resetCalendar = () => async dispatch => dispatch({ type: ACTION_TYPES_CALENDAR.RESET });

export const reset = () => async dispatch => {
  dispatch({
    type: ACTION_TYPES.RESET
  });
  dispatch({ type: ACTION_TYPES_LIST.RESET });
  dispatch({ type: ACTION_TYPES_DISABLED.RESET });
  dispatch({ type: ACTION_TYPES_PENDING.RESET });
};
