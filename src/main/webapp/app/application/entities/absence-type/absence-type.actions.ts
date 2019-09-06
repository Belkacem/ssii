import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/absence-type/absence-type.reducer';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IAbsenceType } from 'app/shared/model/absence-type.model';

const apiUrl = 'api/absence-types';

// Actions
export const deleteAbsenceTypes = (ids: any[]) => {
  const requestUrl = `${apiUrl}/bulk?ids=${ids.join(',')}`;
  return {
    type: ACTION_TYPES.DELETE_ABSENCETYPE,
    payload: axios.delete(requestUrl)
  };
};

export const createAbsenceType = (absenceType: IAbsenceType) => ({
  type: ACTION_TYPES.CREATE_ABSENCETYPE,
  payload: axios.post(apiUrl, cleanEntity(absenceType))
});

export const updateAbsenceType = (absenceType: IAbsenceType) => ({
  type: ACTION_TYPES.UPDATE_ABSENCETYPE,
  payload: axios.put(apiUrl, cleanEntity(absenceType))
});
