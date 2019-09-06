import axios from 'axios';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IAbsenceBalanceAdjustment } from 'app/shared/model/absence-balance-adjustment.model';
import { ACTION_TYPES } from 'app/entities/absence-balance-adjustment/absence-balance-adjustment.reducer';

const apiUrl = 'api/absence-balance-adjustments';

// Actions

export const createAbsenceBalanceAdjustment = entity => ({
  type: ACTION_TYPES.CREATE_ABSENCEBALANCEADJUSTMENT,
  payload: axios.post(`${apiUrl}?override`, cleanEntity(entity))
});

export const getAbsenceBalanceAdjustmentsByBalanceIn = (absenceBalanceIds: number[]) => {
  const requestUrl = `${apiUrl}?override&absenceBalanceIds=${absenceBalanceIds.join(',')}&page=0&size=999&sort=date,desc`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEBALANCEADJUSTMENT_LIST,
    payload: axios.get<IAbsenceBalanceAdjustment>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};
