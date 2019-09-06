import axios from 'axios';
import { ACTION_TYPES } from 'app/entities/expense-type/expense-type.reducer';
import { cleanEntity } from 'app/shared/util/entity-utils';
import { IExpenseType } from 'app/shared/model/expense-type.model';

const apiUrl = 'api/expense-types';

// Actions
export const deleteExpenseTypes = (ids: any[]) => {
  const requestUrl = `${apiUrl}/bulk?ids=${ids.join(',')}`;
  return {
    type: ACTION_TYPES.DELETE_EXPENSETYPE,
    payload: axios.delete(requestUrl)
  };
};

export const createExpenseType = (expenseType: IExpenseType) => ({
  type: ACTION_TYPES.CREATE_EXPENSETYPE,
  payload: axios.post(apiUrl, cleanEntity(expenseType))
});

export const updateExpenseType = (expenseType: IExpenseType) => ({
  type: ACTION_TYPES.UPDATE_EXPENSETYPE,
  payload: axios.put(apiUrl, cleanEntity(expenseType))
});
