import axios from 'axios';
import { IHoliday } from 'app/shared/model/holiday.model';
import { ACTION_TYPES } from 'app/entities/holiday/holiday.reducer';
import { cleanEntity } from 'app/shared/util/entity-utils';

const apiUrl = 'api/holidays';

// Actions
export const getHolidaysByDate = (startDate, endDate) => {
  const requestUrl = `${apiUrl}?override&size=999&startDate=${startDate}&endDate=${endDate}`;
  return {
    type: ACTION_TYPES.FETCH_HOLIDAY_LIST,
    payload: axios.get<IHoliday>(`${requestUrl}&cacheBuster=${new Date().getTime()}`)
  };
};

export const deleteHolidays = (ids: any[]) => {
  const requestUrl = `${apiUrl}/bulk?ids=${ids.join(',')}`;
  return {
    type: ACTION_TYPES.DELETE_HOLIDAY,
    payload: axios.delete(requestUrl)
  };
};

export const createHoliday = (holiday: IHoliday) => ({
  type: ACTION_TYPES.CREATE_HOLIDAY,
  payload: axios.post(apiUrl, cleanEntity(holiday))
});

export const updateHoliday = (holiday: IHoliday) => ({
  type: ACTION_TYPES.UPDATE_HOLIDAY,
  payload: axios.put(apiUrl, cleanEntity(holiday))
});
