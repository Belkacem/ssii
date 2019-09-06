import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/expense-justification/expense-justification.reducer';
import { IExpenseJustification } from 'app/shared/model/expense-justification.model';
import { cleanEntity } from 'app/shared/util/entity-utils';

const apiUrl = 'api/expense-justifications';

export const getByExpenseId = (expenseId: number) => dispatch =>
  dispatch({
    type: ACTION_TYPES.FETCH_EXPENSEJUSTIFICATION_LIST,
    payload: axios.get<IExpenseJustification>(`${apiUrl}/${expenseId}?override`)
  });

export const create = (justification: IExpenseJustification) => dispatch =>
  dispatch({
    type: ACTION_TYPES.CREATE_EXPENSEJUSTIFICATION,
    payload: axios.post(apiUrl, cleanEntity(justification))
  });
