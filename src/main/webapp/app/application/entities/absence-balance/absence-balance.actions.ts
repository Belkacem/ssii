import axios from 'axios';
import { IAbsenceBalance } from 'app/shared/model/absence-balance.model';
import { ACTION_TYPES } from 'app/entities/absence-balance/absence-balance.reducer';

const apiUrl = 'api/absence-balances';

// Actions

export const getAbsenceBalancesByResource = resourceId => {
  const requestUrl = `${apiUrl}?override&resourceId=${resourceId}&page=0&size=999&sort=date,desc`;
  return {
    type: ACTION_TYPES.FETCH_ABSENCEBALANCE_LIST,
    payload: axios.get<IAbsenceBalance>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};
