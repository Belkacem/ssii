import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/absence-justification/absence-justification.reducer';
import { IAbsenceJustification } from 'app/shared/model/absence-justification.model';
import { cleanEntity } from 'app/shared/util/entity-utils';

const apiUrl = 'api/absence-justifications';

export const getByAbsenceId = (absenceId: number) => dispatch =>
  dispatch({
    type: ACTION_TYPES.FETCH_ABSENCEJUSTIFICATION_LIST,
    payload: axios.get<IAbsenceJustification>(`${apiUrl}/${absenceId}?override`)
  });

export const create = (justification: IAbsenceJustification) => dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_ABSENCEJUSTIFICATION,
    payload: axios.post(apiUrl, cleanEntity(justification))
  });
